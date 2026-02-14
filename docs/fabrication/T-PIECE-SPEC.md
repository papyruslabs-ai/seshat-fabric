# T-Piece Fabrication Specification

## 1. Geometry Overview

The T-piece is the universal cell of the Seshat Fabric system. One shape, one manufacturing template, all configurations.

```
        ←── crossbar_length ──→
        ┌─────────────────────┐  ─┬─ crossbar_width
  EP_L ─┤                     ├─ EP_R
        └──────────┬──────────┘  ─┴─
                   │
                   │ ← stem_width
                   │
                   │  stem_length (variable)
                   │
                   ●  ← stem_tip (magnetic connector)
```

### Naming Convention

| Feature | Abbreviation | Description |
|---------|-------------|-------------|
| EP_L | Endpoint Left | Left end of crossbar, point connection (−X face) |
| EP_R | Endpoint Right | Right end of crossbar, point connection (+X face) |
| ST_TIP | Stem Tip | Point connection at end of stem (−Y extremity) |
| F_TOP | Face Top | Face connection along top of crossbar (+Y face) |
| F_LEFT | Face Left | Face connection along left of crossbar (−Z face) |
| F_RIGHT | Face Right | Face connection along right of crossbar (+Z face) |
| CB_EDGE | Crossbar Edge | Long continuous edge of crossbar (forms polygon edges) |
| STEM | Stem | Variable-length member extending from crossbar center |
| FLEX | Flex Zone | Compliant section of stem (allows length variation) |

## 2. Parametric Dimensions

### Core Parameters

| Parameter | Symbol | Range | Default (25mm) | Default (50mm) |
|-----------|--------|-------|-----------------|-----------------|
| Crossbar length | L_cb | 4-100 mm | 25 mm | 50 mm |
| Crossbar width | W_cb | 1-10 mm | 3 mm | 5 mm |
| Crossbar thickness | T_cb = W_cb | 0.5-10 mm | 3 mm | 5 mm |
| Stem width | W_st | 1-8 mm | 2.5 mm | 4 mm |
| Stem min length | L_st_min | 2-40 mm | 5 mm | 10 mm |
| Stem max length | L_st_max | 4-60 mm | 15 mm | 25 mm |
| Stem thickness | T_st | 0.5-5 mm | 2 mm | 3 mm |
| Magnet diameter | D_mag | 1-10 mm | 3 mm | 5 mm |
| Magnet depth | H_mag | 0.5-5 mm | 1.5 mm | 2 mm |
| Wall thickness (min) | T_wall | ≥ 0.4 mm | 0.8 mm | 1.0 mm |

**Note on electrical contacts**: When bond-through contacts are added (Milestone 3+, see Section 6), the crossbar must be wide enough to house contact pads around the magnet bore on each end face. The minimum crossbar width becomes:

```
W_cb_elec = D_mag + 2 × (D_pad + gap)
```

| Cell Scale | D_mag | D_pad | Gap | W_cb_elec | Ratio W/L |
|-----------|-------|-------|-----|-----------|-----------|
| 25mm | 3mm | 0.8mm | 0.3mm | 5.2mm | 21% |
| 12mm | 2mm | 0.5mm | 0.2mm | 3.4mm | 28% |

For Milestone 1-2 (no wired contacts), the base dimensions above apply. For Milestone 3+, use W_cb_elec values.

### Derived Dimensions

```
Polygon edge length = L_cb (crossbar forms the polygon edge)
Triangle inscribed radius = L_cb × √3/6 ≈ 0.289 × L_cb
Hexagon inscribed radius = L_cb × √3/2 ≈ 0.866 × L_cb
Stem must reach center: L_st_max ≥ polygon inscribed radius
```

For 25mm crossbar:
- Triangle: stem must reach ≥ 7.2mm ✓ (L_st_max = 15mm)
- Hexagon: stem must reach ≥ 21.7mm ✓ (L_st_max = 15mm... **too short!**)

**Correction**: For hexagon assembly, L_st_max must be at least 0.866 × L_cb.
For 25mm crossbar: L_st_max ≥ 21.7mm → set to 22mm.

Updated defaults:

| Parameter | 25mm preset | 50mm preset |
|-----------|-------------|-------------|
| L_st_max | 22 mm | 44 mm |

## 3. Connection Zones

Each T-piece has **6 connection zones**, divided into two types. Every connection zone serves a dual purpose: **magnetic bonding** (structural) and **electrical contact** (communication + power). The magnetic bond physically holds cells together; the electrical contacts route power, data, and timing signals through the same bond point. See Section 6 for the full electrical contact architecture.

The crossbar has a **square cross-section** (W_cb = T_cb). This gives the crossbar four distinct faces, three of which are available for connections (the fourth face is where the stem attaches).

### 3.1 Point Connections (Magnetic Dipoles)

Point connections use cylindrical permanent magnets in cylindrical bores. They form the primary bonding mechanism for polygon assembly.

| Zone | Location | Polarity | Role |
|------|----------|----------|------|
| **EP_L** | Left end of crossbar (−X face) | South-out | Intra-polygon: connects to EP_R of adjacent cell |
| **EP_R** | Right end of crossbar (+X face) | North-out | Intra-polygon: connects to EP_L of adjacent cell |
| **ST_TIP** | End of stem (−Y extremity) | North-out | Hybrid: polygon center + routing + inter-structure |

```
    ┌─────┐
    │  ○  │ ← Magnet recess (cylindrical bore)
    │     │    D_mag diameter, H_mag depth
    └─────┘
```

- EP_L and EP_R have **opposite polarity** — two cells meeting endpoint-to-endpoint attract naturally
- Recess has slight interference fit (0.05mm smaller than magnet OD)
- ST_TIP is the primary candidate for **EPM (electropermanent magnet)** switching — see Section 3.3
- When 3+ stems meet at polygon center, alternating polarity is achieved by rotation
- **Electrical contacts**: NdFeB magnets are electrically conductive (Ni-Cu-Ni plated). The magnet face-to-face contact at each EP serves as the GND signal, reducing the number of additional contact pads from 4 to 3 (V+, DATA, TRIG). See Section 6.3 for contact geometry.

### 3.2 Face Connections (Magnetic Strips)

Face connections use magnetic strips (or rows of small magnets) along the full length of a crossbar face. They bond assembled polygons to each other and enable 3D structures.

| Zone | Location | Role |
|------|----------|------|
| **F_TOP** | Top face of crossbar (+Y face) | Inter-polygon: bonds one polygon edge to another in the assembly plane |
| **F_LEFT** | Left face of crossbar (−Z face) | 3D assembly: out-of-plane bonding |
| **F_RIGHT** | Right face of crossbar (+Z face) | 3D assembly: out-of-plane bonding |

```
Cross-section of crossbar (looking along X-axis):

         F_TOP (+Y)
    ┌─────────────────┐
    │                 │
F_LEFT (-Z)      F_RIGHT (+Z)
    │                 │
    └────────┬────────┘
             │  ← Stem attaches here (no connection zone on -Y face)
```

- **F_TOP** is the primary inter-polygon connector. When two hexagons share an edge, their crossbars are parallel — F_TOP of one bonds to F_TOP of the other, freeing EP_L/EP_R exclusively for intra-polygon bonding.
- **F_LEFT and F_RIGHT** enable 3D layer stacking. A cell in layer N bonds its F_LEFT or F_RIGHT to the F_LEFT or F_RIGHT of a cell in layer N+1.
- Face strips can be implemented as:
  - A row of small disc magnets (e.g., 2mm × 1mm × 5 along the crossbar length)
  - A flexible magnetic strip (3M or similar magnetic tape, cut to length)
  - For switching: EPM strips (NdFeB + AlNiCo alternating segments with a shared coil)
- **Electrical contacts**: The magnetic strip along each face serves as GND (conductive material, face-to-face contact when bonded). Three additional signal traces (V+, DATA, TRIG) are embedded in a palindromic pattern alongside the strip for self-mating compatibility. See Section 6.3 for face contact geometry.

### 3.3 Switchable Connections (EPMs)

For active reconfiguration, some connection zones need to be **switchable** between ON (attract) and OFF (neutral). The recommended technology is the **electropermanent magnet (EPM)**.

An EPM pairs a NdFeB magnet with an AlNiCo 5 magnet, wrapped by a coil:

```
State ON:  NdFeB →→  AlNiCo →→   (aligned: strong external field)
State OFF: NdFeB →→  AlNiCo ←←   (opposed: fields cancel, near-zero)
```

- Switching: ~5ms current pulse through coil (1.5A for 3mm magnets)
- Holding power: zero in both states (bistable)
- Recommended EPM zones:
  - **ST_TIP**: Always EPM (routing, peristalsis)
  - **F_TOP, F_LEFT, F_RIGHT**: EPM for reconfigurable structures (Milestone 3+)
  - **EP_L, EP_R**: Permanent magnet only (structural, rarely need to release)

### Connection Zone Summary

```
Connection zone set: Z = Z_point ∪ Z_face
  Z_point = {EP_L, EP_R, ST_TIP}     ← polygon formation + routing
  Z_face  = {F_TOP, F_LEFT, F_RIGHT} ← inter-polygon + 3D assembly

Each zone carries:
  Magnetic:   structural bond (permanent or EPM)
  Electrical: 4-signal bus {V+, GND, DATA, TRIG}
              GND via conductive magnet/strip contact (built-in)
              V+, DATA, TRIG via dedicated contact pads (Section 6)
```

- Z_point zones form polygon edges (EP) and handle cell transport (ST_TIP)
- Z_face zones connect assembled polygons and enable 3D layered structures
- The bottom face (−Y, where stem attaches) has no connection zone
- Every bonded connection carries power, data, and timing — the fabric's nervous system is inseparable from its skeleton

## 4. Compliant Mechanism (Flex Zone)

The stem must vary in length to accommodate different polygon sizes. This is achieved with a **compliant mechanism** — a section of the stem that flexes elastically.

### Design Options

#### Option A: Living Hinge Accordion

```
    │    │
    │╱╲╱╲│  ← Zigzag living hinge
    │╲╱╲╱│     Extends by straightening
    │    │
```

- Extension ratio: 1.5-2.5× collapsed length
- Force to extend: proportional to material stiffness
- Fatigue life: 1,000-10,000 cycles (PLA), 100,000+ (nylon, PETG)
- Print orientation: hinges perpendicular to layer lines for best flex

#### Option B: Bellows

```
    │      │
    │ ╭──╮ │
    │ ╰──╯ │  ← Concentric bellows
    │ ╭──╮ │     Extends by unfolding
    │ ╰──╯ │
    │      │
```

- Extension ratio: 2-3× collapsed length
- More uniform extension than accordion
- Harder to 3D print (thin walls, overhangs)
- Better for larger cell sizes (≥25mm)

#### Option C: Telescoping Sleeve

```
    ┌──┐
    │  ├──┐
    │  │  ├──┐
    │  │  │  │  ← Nested tubes
    │  │  │  │     Extends by sliding
    │  │  ├──┘
    │  ├──┘
    └──┘
```

- Extension ratio: 2-4× collapsed length
- Requires tight tolerances (printer-dependent)
- No fatigue issue (sliding, not flexing)
- Needs retention feature to prevent falling apart
- Best for larger cells (≥50mm) or CNC-machined

**Recommendation**: Option A (accordion) for initial prototypes. Simplest to print, adequate extension ratio, self-centering when magnets pull from both ends.

### Stem Wiring Through the Flex Zone

The stem carries electrical signals from the crossbar PCB to the stem tip (ST_TIP). Conductors must survive repeated extension and compression of the flex zone.

**Signals through the stem**:

| Conductor | Purpose | Direction |
|-----------|---------|-----------|
| EPM_A | EPM coil terminal A | Crossbar → ST_TIP |
| EPM_B | EPM coil terminal B | Crossbar → ST_TIP |
| HALL_OUT | Hall sensor analog return | ST_TIP → Crossbar |
| TRIG (optional) | Trigger line for coilgun / sync | Crossbar → ST_TIP |

Total: 3-4 conductors through the stem.

**Routing options**:

| Method | Milestone | Description |
|--------|-----------|-------------|
| Loose wire bundle | 1-2 | 36-40 AWG insulated magnet wire, loosely coiled inside the stem cavity with enough slack for full extension (slack length = L_st_max - L_st_min). Simple, hand-assembled. |
| Flex PCB ribbon | 3+ | Thin flex PCB strip (0.1mm thick, 2mm wide) running through a slot in the stem wall. The ribbon folds in zigzag with the accordion. Same strip can carry the EPM coil as a planar spiral (printed coil). |
| Coil-integrated leads | 3+ | EPM coil leads serve double duty — the coil is wound on a bobbin that slides inside the stem, and the leads extend back to the crossbar. Hall sensor wire runs alongside. |

**Critical constraint**: The flex zone conductor must tolerate the same cycle count as the mechanical flex zone:
- PLA: 1,000 cycles → bare magnet wire adequate (fatigue-resistant copper)
- PETG/Nylon: 10,000-100,000 cycles → use stranded wire or flex PCB (solid wire fatigues earlier)

For the flex PCB approach, the ribbon's neutral axis should align with the accordion's neutral bending axis to minimize strain on the traces.

## 5. Assembly Geometry

### Triangle (3 T-pieces)

```
         EP
        ╱  ╲
      CB    CB
      ╱      ╲
    EP ─ CB ─ EP
          │
     (stems meet at center)
```

- 3 crossbars form the edges
- 3 stems extend inward to center point
- Stem length = triangle inscribed radius = L_cb × √3/6
- Interior angle: 60°
- Each T-piece rotated 120° from neighbors

### Hexagon (6 T-pieces)

```
      EP ─ CB ─ EP
     ╱              ╲
   CB                CB
   ╱                  ╲
 EP                    EP
  │                    │
 CB     (center)      CB
  │                    │
 EP                    EP
   ╲                  ╱
   CB                CB
     ╲              ╱
      EP ─ CB ─ EP
```

- 6 crossbars form the edges
- 6 stems extend inward to center point
- Stem length = hexagon inscribed radius = L_cb × √3/2
- Interior angle: 120°
- Each T-piece rotated 60° from neighbors

### Square (4 T-pieces)

```
  EP ─ CB ─ EP
  │          │
  CB   (c)   CB
  │          │
  EP ─ CB ─ EP
```

- 4 crossbars form the edges
- 4 stems extend inward to center
- Stem length = L_cb / 2
- Interior angle: 90°

### Octagon + Square Tiling

```
  Oct ─ Oct ─ Oct
  │    Sq    │
  Oct ─ Oct ─ Oct
  │    Sq    │
  Oct ─ Oct ─ Oct
```

The squares between octagons provide attachment points for lattice struts to a second layer.

### Multi-Polygon Assembly (F_TOP)

When two polygons share an edge, their adjacent crossbars are parallel. The **F_TOP** face connection bonds them:

```
Polygon A:   ─── CB_a ───     F_TOP_a faces up (+Y)
                  ↕↕↕          magnetic strip bond
Polygon B:   ─── CB_b ───     F_TOP_b faces down (−Y, flipped)
```

This frees EP_L/EP_R exclusively for intra-polygon bonding. Two hexagons share an edge by F_TOP bonding, not by sharing EP connections.

### 3D Layer Stacking (F_LEFT, F_RIGHT)

For volumetric structures, cells in different layers bond via F_LEFT and F_RIGHT:

```
Layer N:     ─── CB_n ───     F_RIGHT faces out (+Z)
                  ↕↕↕          magnetic strip bond
Layer N+1:   ─── CB_n+1 ───   F_LEFT faces in (−Z)
```

A fully-bonded cell has at most 6 connections: EP_L, EP_R, ST_TIP, F_TOP, F_LEFT, F_RIGHT. By the Maxwell counting criterion, this is exactly at the rigidity threshold in 3D.

## 6. Electrical Contact Architecture

Every magnetic bond doubles as an electrical connection. This section specifies the three communication layers, the 4-signal bus carried at each bond, and the physical contact geometry for each connection zone type.

### 6.1 Communication Layers

The fabric operates three simultaneous communication layers, each optimized for a different speed/richness tradeoff. Together they form the fabric's nervous system.

| Layer | Name | Medium | Latency / Hop | Data Rate | Biological Analogy |
|-------|------|--------|---------------|-----------|-------------------|
| 1 | Config | BLE 5.0 radio (wireless) | 5-15 ms | 2 Mbps shared | Hormones |
| 2 | Data | UART through bond contacts (wired) | 1-10 μs | 1-10 Mbps per link | Nerves |
| 3 | Trigger | Dedicated wire through bond | ~10 ns | Binary pulse | Reflex arc |

**Layer 1 — Config (BLE, wireless, ms)**

Slow, rich, wireless. Every cell has a BLE radio (ESP32-C3). No physical contacts needed. This layer carries:
- Mesh topology discovery ("who are my neighbors?")
- Role assignment ("cells 400-500: prepare coilgun mode along vector [0.3, 0.7, 0.0]")
- Status reports, diagnostics, OTA firmware updates
- External communication (phone, laptop, other fabrics)

Adequate for reconfiguration commands and status. **Too slow** for any real-time coordination (sound, coilgun, phased array phase alignment).

At 65K+ cells, BLE mesh saturates (~40 channels for ~10K+ nodes). Layer 1 transitions to a coordinator-only role: ~1 per 50-cell cluster, with Layer 2 handling intra-cluster traffic.

**Layer 2 — Data (wired UART, μs)**

Fast, wired, through magnetic bond contacts. Carries:
- Sensor data streams (Hall readings, accelerometer, temperature)
- Distributed compute tasks and results
- Sound synthesis waveforms (cell-to-cell sample streaming)
- Echolocation signal processing
- Coordinate assignment and mesh routing at scale

Protocol: half-duplex UART. 115,200 baud minimum (Milestone 2), scaling to 10 Mbaud (Milestone 4+). Single data wire with turn-taking. Each cell's MCU handles the UART in hardware (ESP32-C3 has 2 UART peripherals).

**Layer 3 — Trigger (dedicated wire, ns)**

The fastest layer. A single binary signal: **NOW**. No data payload — just a pulse edge.

Each cell is pre-loaded (via Layer 1 or 2) with:
- What action to perform when triggered
- How much local delay to add before (a) acting and (b) propagating

The trigger propagates cell-to-cell at near-wire speed (~10 ns per bond). But the firing **sequence** is created by each cell's local delay, not by propagation timing. This is the critical distinction:

```
Coilgun example (20-cell barrel, projectile at 40 m/s):

Layer 1 (BLE):  "Cells 1-20: coilgun mode. Pulse width 2ms. Projectile ETA: 100ms."
Layer 2 (UART): Distributes per-cell delay values:
                Cell 1: 0μs, Cell 2: 150μs, Cell 3: 300μs, ... Cell 20: 2,850μs
Layer 3 (TRIG): Cell 1 fires on trigger edge.
                Trigger propagates to all 20 cells in ~200ns (effectively instant).
                Each cell fires after its own programmed delay.

Result: a 2,850μs firing sequence with <1μs jitter, no central clock needed.
```

This is how biological nervous systems work: slow chemical signaling configures the response (neurotransmitter modulation), fast electrical impulses trigger it (action potential propagation), and each motor neuron has its own calibrated response time.

### 6.2 Signal Set

Each bond carries 4 signals. The conductive magnet or magnetic strip provides GND for free.

| Signal | Symbol | Type | Purpose |
|--------|--------|------|---------|
| **Ground** | GND | Always-on | Common reference. Carried by the magnet body itself (Ni-Cu-Ni plated NdFeB is conductive). Zero additional hardware. |
| **Power** | V+ | Bidirectional DC | Power distribution (3.3V regulated or raw battery ~3.7V). Harvester cells push power to compute-heavy neighbors. Direction controlled per-cell by power management IC. |
| **Data** | DATA | Half-duplex digital | UART at 1-10 Mbps (Layer 2). Single wire with turn-taking protocol. |
| **Trigger** | TRIG | Unidirectional pulse | Open-drain with weak pull-up. Cell fires trigger by pulling low. Propagation direction follows the pre-configured trigger chain. |

**Why GND through the magnet works**: NdFeB magnets are metal alloys with resistivity ~1.4 μΩ·m (comparable to stainless steel). With Ni-Cu-Ni plating (standard for corrosion protection), surface contact resistance is 10-50 mΩ at the interface. For a GND bus carrying <100 mA per bond, the voltage drop is <5 mV. Negligible.

**Power routing topology**: V+ forms a power mesh through the fabric. Each cell has a charge controller (TP4056 or equivalent) and can operate in one of three power modes:
- **Source**: Cell's harvester (solar, Faraday) generates more than it consumes → exports V+ to neighbors
- **Sink**: Cell consumes more than it generates (e.g., during compute) → imports V+ from neighbors
- **Pass-through**: Cell relays power from one bond to another (default idle mode)

### 6.3 Contact Geometry by Zone

#### EP_L and EP_R (Endpoint Contacts)

The crossbar end face is a square (W_cb × T_cb). The magnet occupies the center bore. Three contact pads surround the bore — the magnet itself is the fourth contact (GND).

**Convention**: EP_L has **spring contacts** (protrude from face). EP_R has **flat pads** (flush with face). Since EP_L always mates with EP_R (opposite magnetic polarity), springs always meet pads.

```
EP_L end face (spring side):        EP_R end face (pad side):

    ┌───────────┐                    ┌───────────┐
    │  ↑V+      │                    │  ═V+      │
    │     (M)   │                    │     (M)   │
    │ ↑DAT ↑TRG │                    │ ═DAT ═TRG │
    └───────────┘                    └───────────┘

    ↑ = spring contact               ═ = flat pad
    (M) = magnet face (GND)          (M) = magnet face (GND)
```

When cells bond EP_R → EP_L:
1. Magnets attract (N→S), pulling faces together
2. Magnet faces touch → GND connected (zero additional hardware)
3. Spring contacts compress against flat pads → V+, DATA, TRIG connected
4. Spring force provides wipe action (self-cleaning, reliable contact)

**Contact technology by cell scale**:

| Cell Scale | W_cb (with contacts) | Contact Type | Spring Force (per contact) | Magnetic Force | Net Bond Force |
|-----------|---------------------|-------------|---------------------------|---------------|----------------|
| 25mm | 5.2mm | Pogo pin (0.5mm dia) | 0.10 N | 1.09 N (3mm N42) | 0.79 N |
| 12mm | 3.4mm | Leaf spring (0.3mm) | 0.03 N | 0.32 N (2mm N52) | 0.23 N |
| 6mm | 2.5mm | Conductive elastomer | 0.01 N | 0.32 N (2mm N52) | 0.29 N |

**Pogo pins** (25mm+ cells): Standard PCB test pins, 0.5-1.0mm diameter. Press-fit into printed bores in the crossbar end face. Gold-plated tip, internal spring, 0.5-1.0mm working stroke. Source: Mill-Max 0985 series or equivalent. ~$0.10/pin.

**Leaf springs** (12mm cells): Bent phosphor bronze strips (0.1mm thick, 0.3mm wide), soldered to flex PCB. Protrude 0.3mm from face. Compact, low spring force, adequate wipe. Source: custom-bent from strip stock, or as part of flex PCB assembly.

**Conductive elastomer** (6mm cells): Silicone rubber loaded with carbon or silver particles. Molded as small bumps (0.2mm proud) on a thin membrane. Zero spring force — relies entirely on magnetic compression. Source: Shin-Etsu or custom-molded from conductive silicone. ~$0.01/contact.

#### ST_TIP (Stem Tip Contacts)

The stem tip carries an EPM (switchable magnet) and connects to other stem tips at polygon centers or to transit cells during peristalsis. The electrical requirements at ST_TIP are simpler than at EP:

**What ST_TIP needs**:
- EPM coil drive (2 wires from H-bridge on crossbar PCB — internal, not bond contacts)
- Hall sensor return (1 wire to ADC on crossbar PCB — internal)
- Optional: TRIG line for coilgun/sync chains through the polygon center

**What ST_TIP does NOT need at the bond interface**:
- V+ and DATA are carried by the EP ring (cells in a polygon communicate via EP_L → EP_R around the perimeter). The stem tip doesn't need to duplicate this.
- Power flows around the polygon's EP ring, not through the stem tips.

**Contact design**: ST_TIP has only the EPM magnet face (GND) and one optional spring contact (TRIG). This keeps the stem tip small and avoids routing a full 4-signal bus through the flex zone.

```
ST_TIP:
    ┌─────┐
    │     │
    │ (EPM)│ ← EPM magnet face (GND if in contact)
    │  ↑T  │ ← Optional TRIG spring contact
    └─────┘
```

For polygon center connections: 3-6 stem tips cluster at the center. Adjacent tips may touch, forming TRIG chains through the polygon center. This provides an alternative trigger path (through the center) that's shorter than going around the EP ring.

**Transit cell communication**: When a transit cell is being routed through the structure (peristalsis), it communicates with relay cells via BLE (Layer 1) for routing instructions. No wired contact is needed during transit — the transit cell is physically sliding past stem tips, not bonded to them. Hall sensors detect its presence without contact.

#### F_TOP, F_LEFT, F_RIGHT (Face Contacts)

Face connections bond parallel crossbars — two cells sharing a polygon edge (F_TOP), or two cells in adjacent layers (F_LEFT/F_RIGHT). The full crossbar length is available for contacts, giving ample room.

**Self-mating challenge**: F_TOP bonds to another cell's F_TOP (flipped 180°). F_LEFT bonds to F_RIGHT. For F_TOP-to-F_TOP bonding, the contact pattern must work when one cell is flipped relative to the other.

**Solution**: Palindromic contact pattern with alternating spring/pad positions.

The magnetic strip runs along the crossbar center (GND). On each side, signal contacts are arranged in a palindromic sequence so the pattern reads the same reversed — ensuring correct signal alignment when one cell is flipped.

```
Face contact layout (viewed from above, along crossbar length L_cb):

    ↑V+  ═DAT  ↑TRG      ═TRG  ↑DAT  ═V+
    ═══════════ MAG STRIP ════════════════     ← GND
    ═V+  ↑DAT  ═TRG      ↑TRG  ═DAT  ↑V+

    ↑ = spring contact    ═ = flat pad
    Reads the same left-to-right and right-to-left (palindrome)
```

When Cell B (flipped 180°) bonds F_TOP to Cell A's F_TOP:
- Cell B's reversed contact pattern aligns springs with pads
- V+ meets V+, DATA meets DATA, TRIG meets TRIG
- Magnetic strip touches magnetic strip → GND

**Verification of self-mating**:
```
Cell A pattern: ↑V+  ═DAT  ↑TRG  ═TRG  ↑DAT  ═V+
Cell B flipped: ═V+  ↑DAT  ═TRG  ↑TRG  ═DAT  ↑V+  (reversed)

Position 1: A=↑V+  meets B=═V+   → spring ↔ pad, V+ ↔ V+    ✓
Position 2: A=═DAT meets B=↑DAT  → pad ↔ spring, DAT ↔ DAT  ✓
Position 3: A=↑TRG meets B=═TRG  → spring ↔ pad, TRG ↔ TRG  ✓
Position 4: A=═TRG meets B=↑TRG  → pad ↔ spring, TRG ↔ TRG  ✓
Position 5: A=↑DAT meets B=═DAT  → spring ↔ pad, DAT ↔ DAT  ✓
Position 6: A=═V+  meets B=↑V+   → pad ↔ spring, V+ ↔ V+    ✓
```

All signals match. Each signal has 2 redundant contacts per face (one on each side of the strip), providing fault tolerance if one contact is dirty or misaligned.

**F_LEFT / F_RIGHT mating**: F_LEFT bonds to F_RIGHT (different face types). No palindrome needed — one face consistently has springs, the other consistently has pads. Convention:
- **F_LEFT**: spring contacts
- **F_RIGHT**: flat pads

**Contact spacing along the crossbar**:

| Cell Scale | L_cb | Contacts per side | Spacing | Contact Width |
|-----------|------|-------------------|---------|---------------|
| 25mm | 25mm | 6 (3 per side of strip) | 4.2mm | 1.0mm |
| 12mm | 12mm | 6 (3 per side of strip) | 2.0mm | 0.5mm |

At 25mm scale, 4.2mm spacing with 1.0mm pads is comfortable for hand assembly and FDM printing. At 12mm scale, 2.0mm spacing with 0.5mm pads requires flex PCB fabrication (not hand-wirable).

**Physical implementation options**:

| Method | Milestone | Description |
|--------|-----------|-------------|
| Discrete pogo pins + pads | 2-3 | Individual pins press-fit into printed recesses. Pads are copper tape or PCB pads glued to face. |
| Flex PCB face strips | 3+ | A thin flex PCB strip (0.1mm thick) glued or press-fit into a channel on each face. Spring contacts are bent tabs on the flex strip. Pads are exposed copper pads on the opposite face's strip. |
| Integrated rigid-flex PCB | 4+ | The crossbar's main PCB extends as flex arms to each face, wrapping around the crossbar cross-section. All contacts are part of one PCB assembly. No separate face strips. |

The integrated rigid-flex approach (Milestone 4+) is the production target: one PCB assembly per cell provides all electronics, all contacts, and the EPM coil traces, eliminating separate wiring entirely.

### 6.4 Internal Bus Architecture

Each cell's MCU connects to all bond contacts through an internal bus on the crossbar PCB:

```
                         Crossbar PCB Layout

    EP_L contacts ←──┬── MCU (ESP32-C3) ──┬──→ EP_R contacts
    (3 pads + GND)   │    │    │    │      │   (3 springs + GND)
                      │   BLE  UART UART   │
                      │   ant  0    1       │
                      │    │    │    │      │
                      ├── H-bridge (DRV8833)├──→ Stem EPM coil leads
                      │    │               │
                      ├── ADC ←── Hall ────┤──→ ST_TIP Hall sensor
                      │                    │
    F_LEFT contacts ←─┤── GPIO (TRIG) ─────┤──→ F_RIGHT contacts
    (3+GND)           │                    │   (3+GND)
                      └── F_TOP contacts ──┘
                          (3+GND)

    UART 0: EP_L ↔ EP_R data bus (intra-polygon ring)
    UART 1: F_TOP / F_LEFT / F_RIGHT (inter-polygon, multiplexed)
    GPIO:   TRIG lines (directly routed, no UART overhead)
```

**UART multiplexing**: The ESP32-C3 has 2 hardware UART peripherals. UART0 is dedicated to the EP ring (highest traffic — intra-polygon communication). UART1 is multiplexed across face connections using GPIO-controlled analog switches (or simply by protocol — only one face link is active at a time in half-duplex mode).

**Trigger routing**: TRIG is a GPIO-level signal, not UART. Each cell's MCU monitors the TRIG input pin (interrupt-driven, <1μs response) and can propagate by asserting TRIG on an output pin connected to the next bond. The MCU can add a programmable delay (hardware timer, ~100ns resolution) before propagating.

### 6.5 Timing Requirements by Capability

The three communication layers enable different emergent properties. This table maps each capability to its timing requirement and the layer that satisfies it:

| Capability | Timing Precision | Layer Required | Why |
|-----------|-----------------|----------------|-----|
| Reconfiguration (peristalsis) | ~10 ms | Layer 1 (BLE) | EPM switching is ~5ms; BLE latency is fine |
| Programmable stiffness | ~5 ms | Layer 1 (BLE) | Toggle EPMs on/off across a region |
| Impact response (auto-stiffen) | <1 ms | Layer 2 (UART) | Hall sensor detects acceleration → stiffen neighbors |
| Distributed compute | ~100 μs | Layer 2 (UART) | Task dispatch and result collection |
| Echolocation | ~50 μs | Layer 2 (UART) | Time-of-flight at 340 m/s over 17mm = 50μs |
| Sound synthesis (20 kHz) | ~5 μs | Layer 2 (UART) + Layer 3 (TRIG) | UART for waveform data, TRIG for phase sync |
| Phased array (audio beam) | ~10 μs | Layer 2 + 3 | Beamforming at 3 kHz needs ~10μs phase accuracy |
| Coilgun firing sequence | ~50 μs per cell | Layer 3 (TRIG) | Pre-loaded delay, triggered by pulse |
| Phased array (RF, 2.4 GHz) | ~40 ps | **Not achievable** | Would require shared clock distribution — future work |
| Synchronized EPM cascade | ~100 μs | Layer 3 (TRIG) | "All cells in region: switch NOW" |
| Faraday harvest coordination | ~1 ms | Layer 2 (UART) | Route harvested energy to where it's needed |

**Key insight**: Layer 3 (TRIG) removes the need for a central clock. Each cell's local timer provides the precision; the trigger provides the synchronization event. This is why a coilgun with 50μs timing can work over 20 cells without a shared oscillator.

**RF phased array limitation**: True RF beamforming at 2.4 GHz requires ~40 picosecond phase accuracy — impossible without a distributed clock or phase-locked loop chain. The fabric can still do RF phased array at lower precision for beam-steering (±10° resolution) using BLE's built-in direction-finding features, but not high-precision radar. Audio-frequency phased arrays (beamformed sound, echolocation) work well within Layer 2+3 timing.

### 6.6 Contact Reliability

Magnetic alignment naturally centers the contacts. The key reliability factors:

| Factor | Mitigation |
|--------|------------|
| Contamination (dust, moisture) | Spring contacts provide wipe action on engagement. Gold plating resists oxidation. |
| Misalignment | Magnetic self-centering to ±0.2mm. Contact pad diameter > alignment tolerance. |
| Wear | Gold-plated copper pads withstand >100K engagement cycles. Pogo pin springs rated for >1M cycles. |
| Vibration / intermittent contact | Magnetic holding force maintains compression. Spring force provides >0.1mm over-travel. UART protocol includes checksums for data integrity. |
| Lost cell detection | Absence of GND continuity (magnet not touching) = neighbor not present. Hall sensor confirms. |

**Contact resistance budget**:

| Path Segment | Resistance | Voltage Drop @ 100mA |
|-------------|------------|---------------------|
| Magnet face (GND) | 10-50 mΩ | 1-5 mV |
| Pogo pin + pad (V+) | 20-100 mΩ | 2-10 mV |
| Pogo pin + pad (DATA) | 20-100 mΩ | N/A (digital signal) |
| Total V+ path | 30-150 mΩ | 3-15 mV |

At 100 mA per bond (maximum expected for power routing), the voltage drop is <15 mV — negligible for a 3.3V bus.

### 6.7 Milestone Phasing

Not all layers are needed from the start. The electrical contact architecture phases in gradually:

| Milestone | Layer 1 (BLE) | Layer 2 (UART) | Layer 3 (TRIG) | Contacts Needed |
|-----------|---------------|----------------|----------------|-----------------|
| 1 "It Moves" | External controller | N/A | N/A | None (wired to external) |
| 2 "It Thinks" | Per-cell BLE mesh | N/A | N/A | None (BLE only) |
| 3 "It Builds" | BLE mesh | EP contacts only | N/A | EP_L/EP_R pads |
| 4 "It Senses" | BLE (coordinators) | EP + Face contacts | ST_TIP TRIG | All zones |
| 5 "It Does Everything" | BLE (external only) | Full wired mesh | Full trigger chain | All zones, optimized |

At Milestone 3, cells gain their first wired contacts (EP endpoints only). This enables power sharing and faster intra-polygon communication. At Milestone 4, face contacts enable inter-polygon data flow and the trigger layer enables time-critical capabilities (sound, coilgun, impact response). By Milestone 5, BLE is reserved for external communication and the entire internal nervous system runs on wired contacts.

## 7. Material Recommendations

### For 3D Printing (Prototyping)

| Material | Flex Life | Strength | Print Ease | Cost | Recommendation |
|----------|-----------|----------|------------|------|----------------|
| PLA | Low (1K cycles) | High | Easiest | $ | First prints only |
| PETG | Medium (10K cycles) | Good | Easy | $ | Good general purpose |
| Nylon (PA12) | High (100K+ cycles) | Good | Hard (warping) | $$ | Best for flex zones |
| TPU 95A | Very high | Low | Medium | $$ | Flex zones only |
| Resin (SLA) | Low | Very high | Medium | $$$ | Best detail at small sizes |

**Strategy**: Print crossbar in PETG (rigid, strong), flex zone in TPU or nylon (fatigue resistant). Multi-material printing or glue assembly.

For sizes < 10mm: SLA resin is the only viable FDM alternative.

### For Production (Future)

| Material | Process | Minimum Feature | Notes |
|----------|---------|----------------|-------|
| Injection-molded nylon | Injection | 0.5mm | High volume, low cost |
| MIM (metal injection molding) | Sintering | 0.3mm | For structural cells |
| CNC aluminum | Machining | 0.1mm | For high-precision cells |
| Flexible PCB substrate | Etching | 0.05mm | For electronic integration |

## 8. Print Orientation

### FDM (Fused Deposition Modeling)

```
Recommended: Crossbar flat on bed, stem pointing up

Build plate:
┌─────────────────────┐
│ ═══════════════════ │ ← Crossbar (flat, good adhesion)
│         ║           │ ← Stem (vertical, good layer adhesion)
│         ║           │
│         ●           │ ← Stem tip (may need support)
└─────────────────────┘
```

- Crossbar parallel to bed: maximum adhesion, smooth top surface
- Stem vertical: layer lines perpendicular to flex direction (strongest orientation)
- Flex zone: layer lines allow bending perpendicular to print axis
- Magnet recesses: print upward (no supports needed for cylindrical bores)

### SLA (Stereolithography)

Any orientation works. Optimize for:
- Minimum support contact on functional surfaces (connection points)
- Flex zone away from build plate (best surface finish)

## 9. Quality Criteria

### Dimensional Tolerances

| Feature | Tolerance | Why |
|---------|-----------|-----|
| Crossbar length | ± 0.2mm | Must align with neighbors |
| Magnet recess diameter | + 0.05mm / - 0.00mm | Interference fit for magnets |
| Contact pad position | ± 0.15mm | Must align with mating spring contacts |
| Contact pad diameter | ± 0.1mm | Must be larger than alignment tolerance |
| Pogo pin bore | + 0.05mm / - 0.00mm | Interference fit for press-fit pogo pins |
| Face contact trace spacing | ± 0.1mm | Palindromic pattern must be symmetric |
| Stem width | ± 0.15mm | Must slide through relay corridors |
| Flex zone thickness | ± 0.1mm | Affects spring constant |
| Overall flatness | < 0.3mm over crossbar | Connection quality (magnetic + electrical) |

### Functional Tests

**Mechanical (all milestones)**:
1. **Snap test**: Two EP connections should click together audibly
2. **Flex test**: Stem extends to L_st_max and returns to L_st_min without permanent deformation
3. **Polygon test**: 3 pieces form triangle, 6 form hexagon, stems meet at center
4. **Hold test**: Hexagon holds together when lifted by one piece (structural integrity)
5. **Route test**: A loose piece can slide through a completed hexagon's center

**Electrical (Milestone 3+)**:
6. **Contact resistance test**: Bond two cells EP_R → EP_L. Measure resistance across each signal pair. Pass: < 200 mΩ for V+ and GND, < 500 mΩ for DATA and TRIG.
7. **UART loopback test**: Connect two cells EP_R → EP_L. Cell A sends 1000 bytes at 115,200 baud via Layer 2. Cell B echoes. Pass: 0% byte error rate.
8. **Trigger latency test**: Cell A asserts TRIG. Oscilloscope measures delay at Cell B's TRIG output. Pass: < 1 μs end-to-end (including MCU interrupt response).
9. **Power sharing test**: Cell A has full battery, Cell B is drained. Bond EP_R → EP_L. Cell B should charge from Cell A. Pass: Cell B reaches 3.0V within 60 seconds.
10. **Face contact self-mate test**: Bond two cells F_TOP → F_TOP (one flipped). Verify all 3 signal pairs + GND are continuous. Pass: < 500 mΩ per pair.
11. **Flex endurance test**: Cycle stem 1,000 times (full extension/compression). After cycling, verify all stem conductor continuity (EPM coil, Hall, TRIG). Pass: < 2Ω resistance change.
12. **Trigger chain test**: 10 cells in a line, each with 100μs programmed delay. Assert TRIG at cell 1. Measure cell 10's EPM fire time. Pass: 900μs ± 20μs total delay (confirms per-cell delay accuracy).
