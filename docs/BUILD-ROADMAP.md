# Seshat Fabric: Build Roadmap

**From First Cell to Exoskeleton — A Goal-Driven Prototype Sequence**

Version 0.1 — February 2026

*Companion to [MATHEMATICAL-FOUNDATIONS.md](./MATHEMATICAL-FOUNDATIONS.md), [DYNAMIC-COGNITION.md](./DYNAMIC-COGNITION.md), and [EMERGENT-CAPABILITIES.md](./EMERGENT-CAPABILITIES.md)*

---

## 0. Your Goals

| # | Goal | Why It Matters |
|---|------|----------------|
| 1 | See cells move themselves through the structure (peristalsis) | Proves the 9D coordinate system has physical reality |
| 2 | See the fabric grow — cells assembling new cells from parts | Proves the logistics model (ship components, not cells) |
| 3 | See emergent properties at scale (antenna, echolocation, compute) | Proves zero-additional-hardware thesis |
| 4 | 65K cell fabric with all 11+ properties | Fundable demonstrator, useful tool in its own right |
| 5 | Coupled operator-fabric system — body lattice, kinesthetic interface, cerebellar intelligence | Proves the dynamic cognition thesis: movement is life, stasis is death |
| 6 | Deployable multi-tool platform — scout drone, dynamic armor, comms, bridge, flight — from a 10 kg backpack | End-state application: every capability deployed simultaneously from one coupled system |

Between these goals lies a gradient of useful intermediate states, each informative and valuable. This document traces the engineering path through them.

---

## 1. Cell Scale Strategy

**Why scale matters**: Smaller cells give better magnetic-to-weight ratio (F_mag/F_grav ∝ 1/L), more cells per area (better emergent properties), and lighter structures. But smaller cells are harder to build by hand and fit less electronics inside.

**Recommended progression**:

| Milestones | Cell Scale | Why |
|-----------|-----------|-----|
| 1-2 | 25mm (tabletop) | Fits ESP32-C3 (5mm QFN). Large enough to hand-assemble. |
| 3-6 | 12mm (wearable) | Transition to automated assembly. 65K cells = ~3m sheet, 5.2 kg. Deployable platform target scale. |

**Key numbers for a 6'4", 230 lb (193 cm, 104 kg) frame**:
- Body surface area (DuBois): ~2.3 m²
- Suit coverage (~80%): ~1.9 m²
- Cells per layer at 12mm: ~13,200
- With 4-5 structural layers: ~53,000-66,000 cells
- **65K cells ≈ one body suit at 12mm scale** (this is not a coincidence — it's the right number)

---

## 2. Bonding Technology: Electropermanent Magnets (EPMs)

Before the milestone details, one critical technology decision. Simple electromagnets are too weak for structural bonds (~0.01-0.1 N vs. ~1 N needed). Permanent magnets are strong but can't be switched. The solution is **electropermanent magnets (EPMs)**.

### How EPMs Work

An EPM pairs two magnets wrapped by a single coil:
- **NdFeB** (neodymium): Very hard to demagnetize. Stays permanent.
- **AlNiCo 5**: Easy to switch polarity with a brief current pulse.

```
State ON:  NdFeB →→  AlNiCo →→   (aligned: strong external field)
State OFF: NdFeB →→  AlNiCo ←←   (opposed: fields cancel, near-zero external)
```

Switching requires a ~5ms current pulse. Zero power to hold either state. This is the technology used in industrial magnetic grippers and MIT's M-Blocks modular robots.

### EPM Specifications (for 25mm cells)

| Component | Spec | Source |
|-----------|------|--------|
| NdFeB magnet | 3mm diameter × 1.5mm thick, N42 or N52 | K&J Magnetics D21-N52, or Amazon bulk |
| AlNiCo 5 magnet | 3mm diameter × 1.5mm thick | See Appendix A |
| Coil wire | 32 AWG magnet wire (~0.20mm), 100 turns | Remington Industries (Amazon) |
| Switching pulse | ~1.5A for 5ms through coil | |
| Coil resistance | ~0.8Ω (100 turns on 3mm core) | |
| Energy per switch | ~14 mJ | |
| External field (ON) | ~0.4 T at surface | |
| External field (OFF) | <0.02 T at surface | |

### Drive Circuit (per EPM)

```
ESP32 GPIO ──→ DRV8833 H-bridge ──→ EPM coil
                    │
              3.7V LiPo or 5V supercap
```

The DRV8833 provides bidirectional current to switch the AlNiCo both ways. Each DRV8833 (~$2) drives 2 EPMs. A 1F 5.5V supercapacitor (~$2) easily delivers the 1.5A × 5ms pulse.

### Where to Use EPMs vs. Permanent Magnets

Not every connection point needs to be switchable:

| Connection Point | Type | Rationale |
|-----------------|------|-----------|
| EP_L, EP_R | Permanent magnet only | Structural bonding. Rarely need to release. Polarity: EP_L = North-out, EP_R = South-out (naturally attract when adjacent cells meet). |
| ST_TIP | **EPM** | Routing, peristalsis, polygon center connections. Must switch. |
| F_TOP, F_LEFT, F_RIGHT | **EPM** (Milestone 3+) | Inter-polygon and 3D assembly. Must switch for reconfiguration. |

For Milestone 1, only ST_TIP needs EPM. EP_L/EP_R are passive permanent magnets — cells click together naturally when brought close.

---

## Milestone 1: "It Moves"

**Goal**: See cells transport through the structure under coordinated magnetic control — peristalsis.

**Cell count**: 20 cells (enough for 2 hexagons sharing an edge + transit cells)

**What this proves**: Magnetic switching works. Sequential handoff works. Cells can be routed through a structure. The physics is real.

### What You Build

A hexagonal ring of 6 cells on a low-friction surface (glass or acrylic sheet). An external controller sequences EPMs at the stem tips to attract a transit cell through the center of the hexagon. The transit cell enters from one side, gets passed from stem to stem, and exits the other side.

Then: two hexagons sharing an edge, with a transit cell routed from the center of one polygon to the center of the other.

### Bill of Materials

**3D Printer and Material**

| Item | Product | Price | Source |
|------|---------|-------|--------|
| FDM printer | Bambu Lab A1 Mini | ~$300 | bambulab.com, Amazon |
| Filament | PETG 1kg (Overture or Bambu) | ~$22 | Amazon |

Print settings: 0.2mm layer height, 3 perimeters, 40% infill. PETG for durability and flex fatigue resistance.

**Magnets**

| Item | Qty | Spec | Price | Source |
|------|-----|------|-------|--------|
| NdFeB (EP_L, EP_R) | 40 | 3mm × 1.5mm disc, N52 | ~$8/100 | Amazon: "3mm x 1.5mm neodymium N52" |
| NdFeB (EPM half) | 20 | 3mm × 1.5mm disc, N52 | (same pack) | |
| AlNiCo 5 (EPM half) | 20 | 3mm × 1.5mm cylinder | ~$15/20 | See Appendix A |

Total magnets: 60 NdFeB + 20 AlNiCo = 80 magnets

**Electronics**

| Item | Qty | Product | Price ea. | Source |
|------|-----|---------|-----------|--------|
| Controller | 1 | ESP32-S3-DevKitC-1 | $10 | Mouser, Digikey, Amazon |
| H-bridge drivers | 10 | DRV8833 breakout board | $2 | Amazon, Adafruit |
| Hall sensors | 20 | SS49E linear Hall effect | $0.50 | Amazon (pack of 20) |
| Supercapacitors | 10 | 1F 5.5V radial | $2 | Mouser, Amazon |
| Flyback diodes | 20 | 1N4148 | $0.05 | Any electronics supplier |
| Prototyping PCB | 2 | 70×90mm perfboard | $2 | Amazon |
| Magnet wire | 1 spool | 32 AWG, 200ft | $10 | Amazon (Remington Industries) |
| Wire, connectors | — | 28 AWG silicone hookup wire, JST-PH | $15 | Amazon |
| Power supply | 1 | USB-C 5V 3A adapter | $10 | Amazon |

**Mechanical**

| Item | Qty | Price | Source |
|------|-----|-------|--------|
| Glass sheet (low-friction surface) | 1 (300×300mm) | $5 | Hardware store, IKEA |
| Cyanoacrylate glue | 1 | $5 | Hardware store |
| Tweezers (for magnet placement) | 1 | $5 | Amazon |

### Budget Summary

| Category | Cost |
|----------|------|
| 3D printer | $300 |
| Filament | $22 |
| Magnets | $23 |
| Electronics | ~$120 |
| Mechanical | $15 |
| **Total** | **~$480** |

### Assembly Guide

**Step 1: Print 20 T-piece bodies**
- Use the parametric design at tabletop preset (25mm crossbar)
- Modify magnet recesses: EP_L and EP_R get 3.2mm diameter × 1.6mm deep bores (slight interference fit for NdFeB)
- ST_TIP gets a 3.2mm × 3.2mm deep bore (room for the NdFeB + AlNiCo stack)
- Add a channel/slot along the stem near ST_TIP for routing the coil leads out
- Print 22 bodies (2 spares)
- Time: ~2 hours total at 0.2mm layer height

**Step 2: Wind EPM coils (20 units)**
- Stack one NdFeB disc on one AlNiCo disc (they'll attract naturally)
- Slide the stack into a 3.2mm ID tube (printed or thin brass tubing)
- Wind 100 turns of 32 AWG magnet wire around the tube
- Secure with a drop of CA glue, leave 5cm leads
- Test: pulse 1.5A through coil for 5ms. The AlNiCo's polarity should flip. Verify with a compass or second magnet — the EPM should attract in one state and repel (or be neutral) in the other.
- Time: ~15 minutes per EPM × 20 = ~5 hours

**Step 3: Insert permanent magnets into EP_L and EP_R**
- Each cell gets 2 permanent NdFeB magnets (EP_L and EP_R)
- **Polarity convention**: EP_L = North-out, EP_R = South-out
- Use a marker to dot the North face of each magnet before inserting
- Press-fit into recesses (the 0.05mm interference holds them)
- Test: bring two cells together EP_R to EP_L — they should click firmly. EP_R to EP_R — they should repel.

**Step 4: Insert EPMs into ST_TIP**
- Press the wound EPM assembly into the ST_TIP bore
- Route coil leads through the stem channel
- Secure with CA glue

**Step 5: Wire to controller**
- Connect each EPM's coil leads to a DRV8833 H-bridge output
- Connect Hall sensors (if installed) to ESP32 analog inputs
- The ESP32-S3 has enough GPIO for ~20 EPM channels (via 10× DRV8833)

**Step 6: Build the demo structure**
- Arrange 6 cells on the glass sheet in a hexagon formation
- EP_L/EP_R permanent magnets click the hexagon together
- Place the 7th cell (transit cell) at one edge, near a stem tip

### Firmware (Conceptual)

```c
// Peristalsis controller — sequences EPMs along a path
// Each EPM has two states: ON (attract) and OFF (neutral)

void move_cell(int from_stem, int to_stem) {
    epm_on(to_stem);         // Attract transit cell toward destination
    delay_ms(50);            // Let field establish
    epm_off(from_stem);      // Release transit cell from source
    delay_ms(200);           // Let cell slide (gravity + attraction)

    // Verify arrival via Hall sensor at destination
    if (hall_read(to_stem) > THRESHOLD) {
        log("Transit cell arrived at stem %d", to_stem);
    }
}

// Route a cell around the hexagon: stem 0 → 1 → 2 → 3 → 4 → 5
void route_hexagon() {
    for (int i = 0; i < 5; i++) {
        move_cell(i, i + 1);
        delay_ms(300);  // Pause between steps for visual effect
    }
}
```

### Test Protocol

| Test | Setup | Pass Criteria |
|------|-------|---------------|
| Magnet polarity | Two cells, bring EP_R → EP_L | Click together, hold when lifted |
| EPM switching | Pulse EPM, test with compass | Field direction reverses |
| Single handoff | Transit cell at stem 0, fire stem 1 | Cell slides to stem 1 position |
| Full transit | Transit cell traverses hexagon | Cell moves through all 6 positions |
| Two-polygon route | Two hexagons, route cell between them | Cell transits from polygon A center to polygon B center |

### What You Learn

- Whether 3mm EPMs generate enough force to overcome friction and slide a cell
- The timing parameters (pulse width, delay between steps) for reliable handoff
- Whether the permanent magnets at EP_L/EP_R provide adequate structural bonding
- Whether the accordion flex zone works (stem extension/compression)
- Any unforeseen geometric interference between transit cells and structure cells
- How much positional slop the magnetic alignment can tolerate

---

## Milestone 2: "It Thinks"

**Goal**: Cells coordinate autonomously — each cell has a brain, knows its position, and participates in distributed decisions. No external controller.

**Cell count**: 50-100 cells

**What this proves**: The 9D coordinate system maps to physical behavior. Distributed intelligence works. Cells can form polygons, route neighbors, and respond to stimuli without centralized control.

### What Changes from Milestone 1

| Component | Milestone 1 | Milestone 2 |
|-----------|-------------|-------------|
| Controller | External ESP32 + wires | **Per-cell ESP32-C3** |
| Communication | Wired | **BLE mesh** |
| Power | Bench supply via wires | **Per-cell LiPo + charging** |
| Hall sensors | Optional (20 for demo) | **3 per cell** (EP_L, EP_R, ST_TIP) |
| Cell count | 20 (2 hexagons) | 50-100 (8-16 hexagons) |

### Bill of Materials (incremental over Milestone 1)

| Item | Qty | Product | Price ea. | Source |
|------|-----|---------|-----------|--------|
| MCU module | 100 | ESP32-C3-MINI-1 (module, not dev board) | $3 | Mouser, LCSC |
| Hall sensors | 300 | SS49E or DRV5053 (SOT-23) | $0.40 | Mouser, LCSC |
| H-bridge (per cell) | 50 | DRV8833 (bare IC, HTSSOP) | $1.50 | Mouser, LCSC |
| LiPo batteries | 100 | 3.7V 80-150mAh micro LiPo | $2.50 | Amazon, Adafruit |
| Charge controller | 100 | TP4056 (SOT-23-6) | $0.10 | LCSC |
| Custom PCB | 100 | Designed for 25mm T-piece | ~$0.50 | JLCPCB (order 110, $50 total) |
| PCB assembly | 100 | JLCPCB SMT assembly service | ~$1.50 | JLCPCB |
| AlNiCo magnets | 100 | 3mm × 1.5mm AlNiCo 5 | $0.50 | See Appendix A |
| NdFeB magnets | 500 | 3mm × 1.5mm N52 (5 per cell × 100) | ~$0.08 | Amazon bulk |
| EPM coils | 100 | Pre-wound on jig or hand-wound | ~$0.50 labor | |

**Custom PCB design** (order from JLCPCB):
- Board dimensions: ~22mm × 2.5mm (fits inside crossbar channel)
- Components: ESP32-C3-MINI-1, DRV8833, 3× SS49E pads, TP4056, LiPo connector
- 2-layer board, 1.0mm thick
- JLCPCB assembly: upload BOM + pick-and-place file, they solder all SMD components
- Cost: ~$50 for PCBs + ~$150 for assembly of 100 boards = ~$200 total

### Budget Summary (Milestone 2)

| Category | Cost |
|----------|------|
| Custom PCBs (assembled) | $200 |
| LiPo batteries | $250 |
| Magnets (NdFeB + AlNiCo) | $90 |
| EPM coils (materials) | $15 |
| Additional filament | $22 |
| **Milestone 2 incremental** | **~$577** |
| **Running total (M1 + M2)** | **~$1,060** |

### Firmware Architecture

```
Per-cell firmware (ESP32-C3):

1. BOOT → Read Hall sensors → Detect neighbors
2. BLE MESH → Announce UUID, neighbor list, connection points
3. COORDINATE ASSIGNMENT:
   - If no neighbors: I am seed cell, assign self (0,0)
   - If neighbors: compute my position relative to them
   - Determine polygon membership (which polygon am I part of?)
4. BEHAVIORAL LOOP:
   - Listen for routing requests ("transit cell incoming from EP_L")
   - Switch EPM to attract/release as needed
   - Report sensor data to mesh
   - Execute policy: stem extension based on polygon type
```

**BLE Mesh protocol**: Use ESP-IDF's Bluetooth Mesh implementation. Each cell is a mesh node. Messages propagate through the mesh with TTL hop limits.

### Test Protocol

| Test | Pass Criteria |
|------|---------------|
| Self-identification | Each cell reports its UUID and neighbor list over BLE |
| Polygon detection | 6 cells correctly identify they form a hexagon |
| Autonomous routing | Cell A requests transit to position B; mesh computes path; cells execute handoffs without external input |
| Damage recovery | Remove a cell from structure; neighbors detect absence; reroute around gap |
| Stem coordination | All cells in hexagon extend stems to correct length for polygon type |

### What You Learn

- BLE mesh reliability, latency, and range at this cell density
- Whether autonomous coordinate assignment converges correctly
- Power consumption in mesh mode (battery life per charge)
- Whether 50-100 cells can self-organize or need seeding
- Real-world switching reliability (how often does an EPM fail to switch?)
- Whether the 44KB policy network concept is needed yet, or if simple rule-based firmware suffices

---

## Milestone 3: "It Builds"

**Goal**: The fabric assembles new cells from a component kit. Exponential growth from seed.

**Cell count**: Start with 200 (seed), grow to 500+

**What this proves**: You can ship component reels, not finished cells. The fabric is its own factory.

### What Changes

This milestone requires:

1. **Redesigned cell for robotic assembly** (design-for-assembly modifications)
2. **Component presentation** (parts in trays/strips, not loose piles)
3. **Assembly firmware** (cells coordinate to build new cells)
4. **Scale transition**: Consider moving from 25mm to 12mm here

### Design-for-Assembly Modifications

| Feature | Current Design | Assembly-Optimized |
|---------|---------------|-------------------|
| Magnet recesses | Cylindrical bore | **D-shaped bore** (keyed — magnet only fits one polarity) |
| Electronics | Custom PCB soldered in | **Flex PCB strip** with snap-fit channel and pressure contacts |
| EPM coil | Hand-wound | **Pre-wound on bobbin**, press-fit into sleeve |
| Stem flex zone | Accordion (integral) | Unchanged |

**Flex PCB strip specification**:
- Dimensions: ~20mm × 2.5mm × 0.3mm (for 25mm cells)
- Components: ESP32-C3-MINI + DRV8833 + 3× Hall sensor + TP4056 + supercap
- All components on one side, contact pads on the other
- The strip press-fits into a channel in the crossbar
- Pads make electrical contact with magnet coils via conductive elastomer buttons or spring pins in the channel
- Order from JLCPCB flex PCB service (~$0.30/strip in quantity 1000+)

**Keyed magnet housings**:
- NdFeB magnets cast into D-shaped polymer shells (epoxy mold)
- The D-shape only fits the recess one way → polarity guaranteed by geometry
- For EPMs: NdFeB + AlNiCo stack in a D-shaped bobbin with pre-wound coil

### Component Kit (per 100 cells)

| Component | Presentation | Qty/100 | Cost/100 |
|-----------|-------------|---------|----------|
| T-bodies | Bulk bag (self-printed or injection molded) | 100 | $10 (filament) |
| Keyed magnet units (EP) | Strip of 200 in tape-and-reel style tray | 200 | $20 |
| EPM units (ST_TIP) | Strip of 100 in tray | 100 | $50 |
| Flex PCB strips | Tray of 100 (panelized, snap-apart) | 100 | $60 |
| LiPo batteries | Tray of 100 | 100 | $150 |
| **Total per 100 cells** | | | **~$290 ($2.90/cell)** |

### Assembly Station Design

The fabric dedicates ~100 cells to form an assembly station:
- **2 pincer groups** (10-15 cells each): grip T-bodies and flex strips
- **1 magnet manipulator** (5-10 cells): uses stem tips to pick up and insert magnets
- **1 verification station** (5 cells): Hall sensor array to test assembled cells

Assembly sequence per cell:
```
1. Pincer A grips T-body from tray             (~10 seconds)
2. Magnet manipulator inserts 2 EP magnets      (~10 seconds)
   - Stem tip attracts keyed magnet from strip
   - Presses into D-shaped recess (self-aligning)
3. Magnet manipulator inserts 1 EPM unit        (~10 seconds)
4. Pincer B feeds flex PCB strip into channel   (~15 seconds)
5. Pincer B inserts LiPo into battery bay       (~10 seconds)
6. Verification: new cell powers on, BLE handshake  (~5 seconds)
7. New cell integrated into fabric edge         (~5 seconds)
Total: ~65 seconds per cell
```

### Growth Rate

| Seed Size | Assembly Stations | Cells/Hour | Time to Double |
|-----------|------------------|------------|----------------|
| 200 | 2 | ~110 | ~2 hours |
| 500 | 5 | ~275 | ~2 hours |
| 1,000 | 8 | ~440 | ~2.3 hours |
| 5,000 | 20 | ~1,100 | ~4.5 hours |

From 200 seed cells with continuous component supply: reach 5,000 cells in ~24 hours.

### Budget Summary (Milestone 3)

| Category | Cost |
|----------|------|
| Seed fabric (200 cells from M2 process) | ~$600 |
| Component kits for 300 new cells | ~$870 |
| Flex PCB tooling (one-time NRE) | ~$100 |
| Keyed magnet mold (3D printed or CNC) | ~$50 |
| **Milestone 3 incremental** | **~$1,620** |
| **Running total** | **~$2,680** |

### What You Learn

- Assembly success rate (what percentage of auto-assembled cells work first try?)
- Which assembly step fails most often (informs design iteration)
- Real growth rate vs. theoretical
- Whether the flex PCB pressure contacts are reliable
- Optimal assembly station size (how many cells per station?)
- Whether the fabric can print its own T-bodies (attach a FDM extruder as a tool)

---

## Milestone 4: "It Senses"

**Goal**: First demonstration of emergent properties at scale. At minimum one of: phased array radio, echolocation, distributed computing, programmable metamaterial.

**Cell count**: 2,000-5,000 cells

**Scale transition**: Move to **12mm wearable cells** here. The 25mm cells were great for hand-building; 12mm is where the emergent properties get interesting and the cell count becomes practical.

### Why 12mm Changes Things

| Property | At 25mm (tabletop) | At 12mm (wearable) |
|----------|-------------------|-------------------|
| Cells in 1m² | 1,600 | 6,944 |
| 5,000 cells as sheet | 1.8m × 1.8m | 0.85m × 0.85m |
| Mass (5K cells) | 2 kg | 0.4 kg |
| Phased array (2.4 GHz) | λ/2 = 62mm (5× cell spacing) | λ/2 = 62mm (5× spacing, still good) |
| Echolocation (40 kHz) | λ/2 = 4.3mm (undersampled) | λ/2 = 4.3mm (need lower freq) |
| Echolocation (20 kHz) | λ/2 = 8.5mm (undersampled) | λ/2 = 8.5mm (borderline) |
| Echolocation (10 kHz) | λ/2 = 17mm (OK) | λ/2 = 17mm (oversampled — good) |

**MCU at 12mm**: ESP32-C3-MINI-1 (5×5mm) fits with ~1mm clearance in the crossbar cavity. Tight but feasible with careful PCB layout.

**Magnets at 12mm**: 2mm × 1mm N52 discs. Available in bulk from Amazon (~$10 for 500).

### Emergent Property Demonstrations

**Easiest to demonstrate first**:

| Property | Min. Cells | Equipment Needed | Difficulty |
|----------|-----------|------------------|------------|
| Distributed compute (mesh) | 100+ | Laptop for benchmarking | Easy |
| Programmable stiffness | 200+ | Force gauge ($30) | Easy |
| Phased array (BLE direction-finding) | 500+ | BLE receiver, spectrum analyzer app | Medium |
| Echolocation (ultrasonic) | 1,000+ | Ultrasonic target, oscilloscope | Medium |
| Phased array (RF beam steering) | 2,000+ | SDR receiver (RTL-SDR, ~$30) | Medium |
| Metamaterial (variable acoustic) | 2,000+ | Speaker, microphone, oscilloscope | Hard |

**Recommended first demonstration**: Programmable stiffness (200 cells in a beam, toggle between flex and rigid modes — visually dramatic, easy to measure with a kitchen scale).

**Recommended second**: Distributed compute benchmark (run a parallelizable calculation across the mesh, measure speedup vs. single cell).

**Recommended third**: Phased array (use the BLE radios already in every cell to create a steerable RF beam; detect with an RTL-SDR dongle).

### New Electronics for 12mm Cells

| Component | Spec | Notes |
|-----------|------|-------|
| MCU | ESP32-C3-MINI-1 (5×5×0.9mm QFN) | Same as M2, just tighter layout |
| Magnets (EP) | 2mm × 1mm N52 NdFeB | Smaller, weaker (~0.32N hold), but cells are lighter (~0.08g) |
| Magnets (EPM) | 2mm × 1mm N52 + 2mm × 1mm AlNiCo 5 | Stack height: 2mm |
| EPM coil | 80 turns 36 AWG on 2mm core | Coil OD: ~4mm |
| Hall sensor | DRV5053 (SOT-23, 2.9×1.6mm) | TI, ~$0.40 |
| Battery | 3.7V 40mAh LiPo (thin cell) | ~$2 |
| PCB | 4-layer flex, 10mm × 1.8mm | JLCPCB, ~$0.40/board in qty 5000 |

### Budget Summary (Milestone 4)

| Category | Cost |
|----------|------|
| New 12mm cell tooling (PCB redesign, magnet molds) | ~$500 |
| Component kits for 5,000 cells at ~$3/cell | ~$15,000 |
| Test equipment (force gauge, RTL-SDR, ultrasonic) | ~$200 |
| **Milestone 4 incremental** | **~$15,700** |
| **Running total** | **~$18,380** |

At this scale, self-assembly from Milestone 3 should handle most of the cell production. The seed from Milestone 2-3 (500 cells at 25mm) won't directly produce 12mm cells — you'll need to hand-build an initial seed of ~200 12mm cells, then let them self-assemble the rest.

### What You Learn

- Whether emergent properties appear at predicted cell counts
- Actual vs. theoretical phased array gain
- Real-world mesh communication reliability at 2,000+ nodes
- Thermal behavior in dense configurations
- Whether 12mm cells can reliably self-assemble (or if 25mm is the minimum for robotic assembly)
- Battery life in active sensing mode

---

## Milestone 5: "It Does Everything"

**Goal**: 65,536 cells. All 11+ emergent properties operational simultaneously. Full demonstrator.

**Cell count**: 65,536 (16-bit addressing)

**What this is**: A ~3m × 3m sheet (or ~0.85m cube) weighing 5.2 kg at 12mm cells. It can:
- Sense its environment (echolocation, magnetic field mapping, cameras on subset)
- Communicate over long range (phased array, 53+ dBi gain)
- Compute onboard (10.5 THz aggregate, enough for 7B LLM inference)
- Change shape (morphing, stiffness control, peristalsis)
- Generate power (130W solar outdoor)
- Self-repair (route around damaged cells)
- Assemble new cells from kit (exponential growth)

This is the fundable demonstrator. A 5 kg sheet that sees, thinks, talks, and reshapes itself.

### Manufacturing Strategy

At 65K cells, hand assembly is impossible. Self-assembly from Milestone 3 is the primary production method:

```
Start: 500 seed cells (from M4 leftovers or hand-built)
Self-assemble at ~1,100 cells/hour (20 stations):

Hour 0:     500 cells
Hour 5:     5,500 cells (50 stations now)
Hour 10:    16,000 cells (100 stations)
Hour 15:    32,000 cells (150 stations — diminishing returns, most cells needed for fabric)
Hour 20:    50,000 cells
Hour 24:    65,000 cells

Total component kit cost: 65,000 × $2.50/cell = ~$162,000 at prototype pricing
```

**Volume pricing** changes the economics dramatically:

| Quantity | PCB Cost/cell | Magnet Cost/cell | Total/cell | 65K Total |
|----------|--------------|-----------------|------------|-----------|
| 1,000 (prototype) | $1.50 | $0.80 | $3.50 | $228K |
| 10,000 (small batch) | $0.60 | $0.40 | $2.00 | $130K |
| 65,000 (target) | $0.30 | $0.20 | $1.20 | $78K |
| 100,000+ (production) | $0.15 | $0.10 | $0.65 | $42K |

### Key Engineering Challenges at 65K

| Challenge | Severity | Mitigation |
|-----------|----------|------------|
| RF congestion (65K BLE radios) | High | Wired-through-bond data for intra-cluster; BLE only for inter-cluster coordinators (~1,300 nodes) |
| Communication diameter (~256 hops) | Medium | Hierarchical control: 50-cell clusters, 500-cell regions, global coordinator |
| Magnetic interference (390K magnets) | Medium | AC-modulated sensing, lock-in amplification on Hall readings |
| Software updates (65K nodes OTA) | Medium | Multicast by cluster, intra-cluster wired propagation |
| Quality variance (some cells defective) | Low | Self-test on boot, automatic isolation of bad cells |
| Power management | Low | Energy routing from harvesters to compute nodes (already designed) |

### Wired-Through-Bond Communication

At 65K cells, BLE mesh cannot handle the traffic (see Scaling Constraints). The solution: when two cells magnetically bond, their contact surfaces also form a **wired data connection**.

Implementation:
- Add 2 spring-loaded pogo pins to each connection face (signal + ground)
- Matching contact pads on mating face
- Protocol: UART at 1-10 Mbps (simple, robust)
- Magnetic alignment ensures pogo pins hit pads consistently

This adds ~$0.10/cell in hardware (pogo pins + pads) but eliminates the RF bottleneck entirely. Intra-cluster communication becomes wired (fast, reliable, no spectrum issues). BLE is reserved for inter-cluster and external communication.

The fabric actually operates **three** communication layers (see [T-PIECE-SPEC Section 6](./fabrication/T-PIECE-SPEC.md) for full specification):
- **Layer 1 (BLE)**: Config and external comms (~ms latency)
- **Layer 2 (Wired UART)**: Sensor data, compute, coordination (~μs latency)
- **Layer 3 (Trigger wire)**: Binary timing pulse for coilgun, sound synthesis, synchronized switching (~ns propagation)

Layer 3 is what enables time-critical capabilities. Each cell is pre-loaded with its action and delay via Layers 1-2, then the trigger pulse fires the sequence. No central clock needed.

### Budget Summary (Milestone 5)

| Category | Cost |
|----------|------|
| Component kits (65K cells at volume pricing) | $78,000 |
| Wired-through-bond upgrade (pogo pins) | $6,500 |
| Seed fabric (from M4) | (already built) |
| Test and measurement equipment | $2,000 |
| Engineering time (firmware, testing, iteration) | (your time) |
| **Milestone 5 total** | **~$87,000** |
| **Running total (all milestones)** | **~$105,000** |

### What You Learn

- Which emergent properties actually work at 65K and which were theoretical
- Real-world scaling limits you can't predict from smaller prototypes
- Whether the 9D coordinate system remains coherent at this scale
- Whether hierarchical control (cell reflex / cluster coordinator / SBC strategist — see [DYNAMIC-COGNITION](./DYNAMIC-COGNITION.md) §3.4) is sufficient or needs additional architecture
- Deployment and redeployment speeds (how fast can it reconfigure between roles?)
- First body lattice tests: can magnetomyography detect muscle activation through 12,000+ Hall sensors? (DYNAMIC-COGNITION Prediction DC-1)
- First dynamic load test: does the traveling stiffness wave support a moving load where a static surface fails? (DYNAMIC-COGNITION Prediction DC-4)
- Performance numbers that no simulation can provide

---

## Milestone 6: "It Couples"

**Goal**: Coupled operator-fabric system. A body lattice (always worn, ~12K cells) provides the kinesthetic interface — biometric sensing, dynamic gait support, impact armor, and hands-free eyes-free communication. A 10 kg backpack (reserve + battery + SBC) provides the staging area, power, and cerebellar intelligence. Together they deploy as scout drone, dynamic armor, comms relay, bridge, flight wing — simultaneously.

This is not an exoskeleton (static load-bearing) or a backpack (passive tool container). It is a **coupled dynamical system** where the operator provides energy and intent, and the fabric provides structure, sensing, intelligence, and force multiplication. See [DYNAMIC-COGNITION](./DYNAMIC-COGNITION.md) for the full theory.

### Why a Backpack — and a Body Lattice

The original analysis assumed the fabric must bear *static* body weight at joints (3,000-4,000 N). Under static analysis, this exceeds magnetic bond capacity. The [Dynamic Cognition](./DYNAMIC-COGNITION.md) framework changes this picture:

**Static analysis was correct**: The fabric cannot carry 104 kg in a standing pose. No single configuration bears that load.

**Dynamic analysis reveals**: The fabric *can* support a moving operator — running, walking, climbing — because each cell bears the load for only ~4ms per footfall, and the support surface pre-positions 74ms ahead of each step using muscle prediction (see DYNAMIC-COGNITION Theorem 1.2). The structure flows. Movement is life; stasis is death.

This means the system has two always-on components:
1. **Body lattice** (~12,000 cells): Always worn, provides biometric input, kinesthetic feedback, dynamic gait support, and impact armor. The operator-fabric interface.
2. **Backpack** (~53,000 cells + battery + SBC): Reserve, staging area, assembly station, power source.

| Deployment | Primary Capability Used | Carries Body Weight? |
|------------|------------------------|---------------------|
| **Body lattice** (always on) | Kinesthetic interface + dynamic gait support + impact armor | **Yes, dynamically** (traveling stiffness wave, not static load) |
| Scout drone / wing | Flight + sensing + phased array | No (carries only itself; operator runs on wing surface) |
| Joint covers | Programmable stiffness + impact absorption | No (your skeleton bears static load; fabric handles impacts) |
| Torso armor | Impact distribution + energy absorption | No (spreads force over area) |
| Comms relay | Phased array antenna | No (rests on surface) |
| Bridge/ramp | Structural rigidity (face connections) | Possibly (see analysis below) |
| Manipulator arm | Shape change + magnetic grip | No (handles small objects) |
| Shelter/cover | Structural rigidity + metamaterial | No (self-supporting, wind load only) |
| Splint/tourniquet | Programmable stiffness | No (wraps limb, locks rigid) |

### System Specification

The system has two physical components: the always-worn body lattice and the backpack.

```
Body lattice (~12K cells at 12mm):  0.96 kg  (head/neck/torso/upper arms, always worn)
Backpack reserve (~53K cells):      4.24 kg
Battery pack (500 Wh LiPo):        3.0 kg
Brain module (SBC):                 0.3 kg
Backpack frame + harness:           1.0 kg
Component reel pocket (repair):     0.5 kg
────────────────────────────────────
Total:                             10.0 kg  (~22 lbs)
```

For a 6'4", 230 lb person: 10 kg is lighter than a typical school backpack. Less than half the weight of a military daypack. The body lattice alone (~1 kg) is comparable to a compression shirt.

**Body lattice** serves as (see [DYNAMIC-COGNITION](./DYNAMIC-COGNITION.md) Section 4):
- **Biometric sensor array**: 10.8M sensor readings/second — muscle activation, heart rate, posture, gait, stress, intent
- **Kinesthetic output**: stiffening, vibration, resistance, texture — 4,600 bits/sec bidirectional hands-free eyes-free interface
- **Dynamic gait support**: traveling stiffness wave pre-positions ahead of each footfall (~74ms lead time via muscle prediction)
- **Impact armor**: reflex stiffening in <5ms at impact point, 600J absorption across 2,000 cells
- **Operator coupling**: the body lattice IS the interface between operator and fabric intelligence

**Backpack** serves as:
- **Battery station**: 500 Wh powers the fabric for 8+ hours of active operation (65W draw)
- **Brain**: SBC (Raspberry Pi 5 / Jetson Orin Nano) runs the cerebellar controller at 10 Hz — strategic layer of the 3-tier inference hierarchy (see [DYNAMIC-COGNITION](./DYNAMIC-COGNITION.md) Section 3.4)
- **Staging area**: Reserve cells pre-organize into deployment-ready configurations while stored
- **Fabrication bay**: Component reels + assembly stations for field self-repair

### Simultaneous Deployment Budget

The fabric doesn't deploy as one thing. It splits into multiple independent deployments, each a subgraph of the full ε-graph:

```
Example: reconnaissance in rough terrain

  Body lattice (always on) ── 12,000 cells  (0.96 kg)
    Head/neck/torso/upper arms coverage
    Biometric sensing, kinesthetic feedback, dynamic gait support
    Impact armor (reflex stiffening <5ms)
    Operator coupling: κ ≈ 0.7+ after training

  Scout drone ──────────────── 8,000 cells   (0.64 kg)
    Manta-ray wing, echolocation, phased array relay
    Altitude: 30-100m, range: 500m, loiter: 20 min on supercap
    Running-on-wing flight if operator acts as engine (see DYNAMIC-COGNITION §5.2)

  Joint covers (4× limb) ──── 4,000 cells   (0.32 kg)
    1,000 per joint (knee × 2, elbow × 2)
    Supplements body lattice for high-impact zones
    Flexible during movement, rigid on impact (<5ms response)

  Comms array ─────────────── 2,000 cells   (0.16 kg)
    Deployed on high ground or treetop
    Phased array: satellite uplink, GPS relay, mesh backbone

  Reserve (in backpack) ──── 39,000 cells   (3.12 kg)
    Self-repair pool
    Next deployment staging
    Assembly station (field repair)
                              ──────
                              65,000 cells   (5.20 kg)
```

### Dynamic Redeployment

The fabric continuously assesses and redeploys based on the situation:

| Situation Change | Redeployment |
|-----------------|-------------|
| Approaching cliff/gap | Recall comms array → deploy as bridge/rope (face connections provide ~3,200N capacity in truss mode) |
| Threat detected | Recall scout → reinforce body lattice with additional layers from reserve + add helmet cover |
| Injury sustained | Reserve cells deploy as rigid splint around limb |
| Need visibility | Launch scout, thin reserve |
| Night / low light | Scout switches to echolocation mode; body lattice provides kinesthetic spatial awareness (darkness is irrelevant) |
| Communication needed | Deploy comms array on elevated point |
| Object retrieval | Deploy manipulator arm (500-1,000 cells, magnetic grip) |
| Rest/camp | Recall all deployments → deploy as shelter dome; body lattice enters autonomous perimeter watch (DYNAMIC-COGNITION Q-DC5) |

Redeployment time depends on the transition:
- Reconfiguring in place (e.g., armor flex→rigid): ~5 ms (EPM switching)
- Recalling a deployment to backpack: ~30-60 seconds (peristalsis, depends on distance)
- Deploying from backpack to body: ~15-30 seconds (cells flow out and self-organize)
- Full role change (armor → drone): ~2-5 minutes (recall, reorganize, deploy)

### Individual Deployment Specifications

#### Scout Drone / Flight Wing (8,000 cells)

The wing operates in two modes:

**Mode A: Autonomous Scout (standard)**

| Parameter | Value |
|-----------|-------|
| Geometry | Manta-ray wing, ~1.5m span × 0.4m chord |
| Mass | 0.64 kg |
| Wing area | 0.6 m² |
| Min. airspeed (glide) | ~1.4 m/s |
| Sensing | Echolocation (~30m range), cameras (if equipped), Hall field mapping |
| Communication | Phased array to backpack, ~1 km range |
| Power | Supercap burst (stored before launch) + solar in flight |
| Loiter time | ~20 min (solar gliding), ~5 min (active sensing) |
| Launch method | Thrown from hand or self-deployed from backpack top |
| Recovery | Returns to backpack, folds, reintegrates into reserve |

**Mode B: Running-on-Wing Flight (operator-coupled, see [DYNAMIC-COGNITION](./DYNAMIC-COGNITION.md) §7.2)**

| Parameter | Value |
|-----------|-------|
| Geometry | Large manta-ray wing, ~3.6 m² area (requires ~40K cells from reserve) |
| Operator interface | Horse-and-rider: harness + weight shift + running gait |
| Power source | Operator running (75-100W mechanical) + solar (30W) = 105W input |
| Power needed | Drag (60W) + EPM (20W) + compute (15W) = 95W → ~10W surplus |
| Speed range | v_stall ≈ 4 m/s (brisk jog) to v_max ≈ 12 m/s (sprint) |
| Key mechanism | Traveling stiffness wave tracks operator footfalls; wing camber maintained by non-foot cells |
| Prediction window | Muscle activation detected 80ms before footfall → support pre-positioned 74ms early |
| **Status** | **Theoretical — requires experimental validation at Milestone 5** |

#### Joint Covers (1,000 cells per joint, supplementing body lattice)

Joint covers are additional layers deployed over the body lattice at high-impact zones. The body lattice itself provides baseline impact protection everywhere; joint covers add extra absorption where falls concentrate force.

| Parameter | Value |
|-----------|-------|
| Geometry | Conformal wrap over body lattice, 1-2 additional layers, ~100 cm² per joint |
| Mass per joint | 0.08 kg |
| Flex mode | All EPMs off — drapes and moves with joint freely |
| Rigid mode | All EPMs on — locks into rigid shell in <5 ms |
| Impact trigger | Hall sensors detect rapid deceleration (>10g) → auto-stiffen (cell reflex policy, Layer 3 — see [DYNAMIC-COGNITION](./DYNAMIC-COGNITION.md) §5.4) |
| Force distribution | Impact spread across ~400 bonds (supplement) + ~800 body lattice bonds (base) |
| Energy absorbed | ~0.3 J per cell × 1,000 = ~300 J per cover (supplement), plus body lattice |
| Recovery | Returns to flex mode 100 ms after impact peak passes |
| Attachment | Wraps over body lattice, held by F_TOP face connections |

The key physics: the body lattice provides *dynamic gait support* (traveling stiffness wave synchronized to footfalls) while joint covers provide *additional impact armor*. Both activate only on impact — a brief, high-force event. Between impacts, everything is flexible and moves with the operator.

#### Body Lattice Armor Function (12,000 cells — the body lattice itself)

The body lattice's ~12,000 cells serve simultaneously as biometric sensor, kinesthetic interface, dynamic gait support, AND impact armor. No separate "torso armor" deployment is needed — armor is an always-on function of the body lattice.

| Parameter | Value |
|-----------|-------|
| Geometry | Head/neck/torso/upper arms, 2-3 layers, ~1,900 cm² |
| Mass | 0.96 kg (the body lattice mass, not additional weight) |
| Impact response | Reflex stiffening in <5ms via cell reflex policies (Layer 3 — see [DYNAMIC-COGNITION](./DYNAMIC-COGNITION.md) §5.4) |
| Stab/puncture resistance | Rigid mode distributes point load across ~500 cells |
| Ballistic | Not rated (cells are plastic + magnets, not ceramic/steel) |
| Blunt impact | Same physics as joint covers, distributed across up to 12,000 cells = ~3,600 J absorption capacity |
| Active threat response | Spatial sensorium detects incoming objects → body lattice pre-stiffens at predicted impact zone before contact |
| Thermal | Cells monitor temperature, open airflow channels if overheating |
| Additional layers | Reserve cells deploy as supplemental armor layers during high-threat periods |

**Honest limitation**: This is impact armor, not ballistic armor. It distributes blunt force (falls, collisions, blows) but will not stop a bullet. Stopping ballistic threats requires materials with much higher specific strength (ceramic, UHMWPE). The fabric could potentially wrap ballistic plates and provide the sensing/communication layer, but the protection itself requires traditional armor materials.

#### Comms Array (2,000 cells)

| Parameter | Value |
|-----------|-------|
| Geometry | Flat sheet, ~0.2 m² |
| Mass | 0.16 kg |
| Phased array gain | ~40 dBi at 2.4 GHz (2,000 elements) |
| Range | ~50-100 km line-of-sight (to another array or base station) |
| Bandwidth | BLE 5: ~2 Mbps; custom protocol potentially higher |
| Deployment | Unfurls on ground, treetop, or elevated surface |
| Power | Solar self-powered when deployed outdoors |

#### Bridge/Ramp (variable cells, from reserve)

| Parameter | Value |
|-----------|-------|
| Geometry | Truss beam, 5-10 layers thick |
| Span | Up to ~2m (limited by cell count and load) |
| Load capacity | Face connections (F_TOP) in truss chord: ~16 N each. 200 bonds across top chord = 3,200 N ≈ 3× body weight |
| Width | ~0.3m (walkable) |
| Cell count | ~15,000-25,000 (requires most of reserve) |
| Deploy time | ~3-5 minutes (cells flow from backpack, self-organize into truss) |
| Limitation | 2m span max for body-weight loading. Longer spans support lighter loads. |

**Note**: This is the one deployment that *does* bear body weight. It works because face connections (magnetic strips along the full crossbar) are ~50× stronger than point connections. A truss beam using face connections in the chords has a capacity of ~3,200 N at the calculated width — enough for a 104 kg person with a 3× safety factor. This needs experimental validation at Milestone 5.

### What This Milestone Adds Over Milestone 5

Milestone 5 proves all the capabilities. Milestone 6 proves they work **together, in the field, under real conditions**:

| Question | What M5 Tells You | What M6 Tells You |
|----------|-------------------|-------------------|
| Does the body lattice detect intent? | Lab magnetomyography test | Does muscle prediction work during real movement in real conditions? |
| Does operator coupling converge? | Initial κ measurements | Does κ reach 0.7+ after 100 hours? Do operators report the fabric "feels like part of me"? |
| Can the fabric fly? | Wind tunnel / lab test | Can it launch from a backpack, scout, and return? Can the operator run on the wing? |
| Does impact armor work? | Drop test on bench | Does it work when you actually fall? Does reflex stiffening via body lattice feel natural? |
| How fast is redeployment? | Lab reconfiguration timing | Can you redeploy under stress in changing conditions? |
| Is the cerebellar model sufficient? | Inference benchmark | Can it anticipate needs kinesthetically — no speech, no screen, no commands? |
| Is 65K enough? | Cell count analysis | Which deployments compete for cells in practice? Does the body lattice plus reserves feel adequate? |

### Budget Summary (Milestone 6)

| Category | Cost |
|----------|------|
| Backpack frame + harness (custom) | ~$200 |
| Battery pack (500 Wh, custom form factor) | ~$500 |
| Brain module (Raspberry Pi 5 or phone mount) | ~$100 |
| Component reel pocket + field repair kit | ~$200 |
| Flight testing equipment (launch rig, tracking) | ~$500 |
| Impact testing equipment (drop rig, force sensors) | ~$500 |
| Field testing consumables | ~$500 |
| **Milestone 6 incremental** | **~$2,500** |
| **Running total (all milestones)** | **~$107,500** |

The incremental cost is small because the fabric itself (65K cells) was built in Milestone 5. Milestone 6 is integration, testing, and field validation — mostly engineering time, not hardware.

### What You Learn

- **Coupling convergence**: How quickly does κ reach useful levels? Is 15 hours of training sufficient for functional coupling? (DYNAMIC-COGNITION Prediction DC-3)
- **Kinesthetic vocabulary**: How many distinct sensations can the operator learn to interpret? At what point does the vocabulary saturate? (DYNAMIC-COGNITION Q-DC3)
- **Dynamic gait support**: Does the traveling stiffness wave feel natural? Does the 80ms prediction window produce smooth support, or do operators feel the pre-positioning as jarring?
- **Movement vs. stasis**: The theory predicts the fabric works during movement but not static standing. Is this limitation tolerable? Do operators naturally keep moving?
- Which deployment configurations are actually useful vs. theoretically interesting
- Failure modes in the field (water, dirt, temperature, rough handling)
- The optimal reserve-to-deployed ratio under real conditions
- Whether the cerebellar model can operate entirely through kinesthetic input/output, or whether linguistic commands are sometimes needed as a fallback
- What the next generation of cells needs to improve (informed by real-world data, not theory)

### Future Directions (Beyond M6)

With a working coupled operator-fabric system proven in the field:

- **Training depth**: Long-term coupling studies — does the kinesthetic interface become a genuine new sense after months of use? (DYNAMIC-COGNITION Q-DC6). Neuroplasticity research suggests this is plausible.
- **Running-on-wing flight**: First human flight attempts with operator as engine. Requires full body lattice + ~40K cell wing + harness system. Potentially the most dramatic demonstration.
- **Multi-operator coupling**: Can two operators share one fabric reserve? Requires the cerebellar model to maintain two independent operator models and arbitrate resource conflicts (DYNAMIC-COGNITION Q-DC4).
- **Scaling up**: Multiple backpacks (200K+ cells total) for team operations. Body lattices communicate via phased array.
- **Specialized cells**: EHD-equipped cells for silent cruise propulsion (see Appendix C), camera cells for vision, hardened cells for bridge structures
- **Commercial applications**: Search and rescue (spatial sensorium works in darkness/smoke), disaster response (self-deploying bridge + comms), field research, military reconnaissance, remote infrastructure inspection
- **Autonomous fabric behavior during sleep**: Perimeter awareness, self-repair, threat detection while operator is unconscious (DYNAMIC-COGNITION Q-DC5)

---

## Scaling Constraints Reference

### Cell Size vs. Capability

| Constraint | Formula | 6mm | 12mm | 25mm | 50mm |
|-----------|---------|-----|------|------|------|
| Mag/weight ratio | ∝ 1/L | 510× | 128× | 128× | 204× |
| Beefiest MCU | (physical fit) | WLCSP 2.5mm | QFN 4mm | QFN 5-7mm | BGA 10mm |
| Max compute/cell | | 64 MHz | 96 MHz | 240 MHz | 1.3 GHz |
| Phased array max freq | c/(2L) | 25 GHz | 12.5 GHz | 6 GHz | 3 GHz |
| Echolocation (useful) | λ/2 > L | >28 kHz | >14 kHz | >6.8 kHz | >3.4 kHz |
| Self-assembly precision | ~L/25 | 0.24mm | 0.48mm | 1mm | 2mm |

### Communication at Scale

| Cell Count | Flat Diameter (hops) | Latency (BLE) | Latency (wired) | Architecture |
|-----------|---------------------|---------------|-----------------|--------------|
| 100 | ~10 | 100ms | 1ms | Flat mesh (OK) |
| 1,000 | ~32 | 320ms | 3.2ms | Flat mesh (OK) |
| 10,000 | ~100 | 1s | 10ms | Hierarchical (needed) |
| 65,000 | ~256 | 2.6s | 26ms | Hierarchical (required) |
| 1,000,000 | ~1000 | 10s | 100ms | Multi-level hierarchy |

### Power Budget

| Cell Count | Solar (outdoor) | Idle Power | Active Power | Surplus |
|-----------|----------------|------------|-------------|---------|
| 100 | 50 mW | 30 mW | 100 mW | Deficit (need battery) |
| 1,000 | 500 mW | 300 mW | 1 W | Marginal |
| 10,000 | 5 W | 3 W | 10 W | ~2 W surplus |
| 65,000 | 33 W | 20 W | 65 W | ~13 W surplus (with duty cycle) |

(Values for 12mm cells at 0.5 mW solar per cell, 0.3 mW idle, 1 mW active average)

---

## Appendix A: Supplier Directory

### Magnets

| Type | Size | Grade | Supplier | Part/Search | Est. Price |
|------|------|-------|----------|-------------|------------|
| NdFeB disc | 3mm × 1.5mm | N52 | K&J Magnetics | D21-N52 | $0.25/ea |
| NdFeB disc | 3mm × 1.5mm | N52 | Amazon | "3mm 1.5mm neodymium N52" (bulk) | $0.08/ea (100+) |
| NdFeB disc | 2mm × 1mm | N52 | Amazon | "2mm 1mm neodymium N52" (bulk) | $0.05/ea (500+) |
| NdFeB disc | 5mm × 2mm | N52 | K&J Magnetics | D82-N52 | $0.40/ea |
| AlNiCo 5 rod | 3mm dia | Grade 5 | First4Magnets (UK) | Custom cut to 1.5mm | ~$0.50/ea |
| AlNiCo 5 rod | 3mm dia | Grade 5 | Magnet Expert Ltd | "AlNiCo rod 3mm" | ~$0.40/ea |
| AlNiCo 5 rod | 2mm dia | Grade 5 | Arnold Magnetic | Custom order (100+ min) | ~$0.60/ea |
| AlNiCo 5 block | Various | Grade 5 | Amazon | "AlNiCo 5 magnet" (cut to size) | Variable |

**AlNiCo sourcing note**: Small AlNiCo cylinders are harder to find than NdFeB. Options:
1. Buy 3mm AlNiCo rod stock and cut to 1.5mm lengths with a diamond saw or abrasive cutoff wheel
2. Custom order from Chinese magnet suppliers (Alibaba: search "AlNiCo 5 cylinder custom")
3. For prototyping quantities (<100): First4Magnets or Magnet Expert Ltd ship internationally

### Microcontrollers

| Part | Package | Key Specs | Supplier | Price |
|------|---------|-----------|----------|-------|
| ESP32-C3-MINI-1 | Module 13×16mm | 160MHz RISC-V, 400KB SRAM, BLE 5 | Mouser, Digikey, LCSC | $3.00 |
| ESP32-C3FN4 | QFN 5×5mm | Same silicon, bare chip (needs antenna) | LCSC | $1.50 |
| ESP32-S3-DevKitC-1 | Dev board | 240MHz dual-core, USB — for external controller | Amazon, Mouser | $10 |
| nRF52805 | WLCSP 2.5×2.5mm | 64MHz Cortex-M4, BLE 5 — for 6mm cells | Mouser | $2.00 |

### Sensors

| Part | Package | Type | Supplier | Price |
|------|---------|------|----------|-------|
| SS49E | TO-92 (through-hole) | Linear Hall, analog | Amazon (20-pack) | $0.50/ea |
| DRV5053 | SOT-23 | Linear Hall, analog, TI | Mouser, LCSC | $0.40/ea |
| AH3503 | TO-92 | Ratiometric linear Hall | Amazon | $0.30/ea |

### Motor Drivers (for EPM coils)

| Part | Package | Channels | Supplier | Price |
|------|---------|----------|----------|-------|
| DRV8833 | Breakout board | 2 H-bridge | Amazon, Adafruit | $2.00/board |
| DRV8833 | HTSSOP-16 (bare IC) | 2 H-bridge | Mouser, LCSC | $1.50/ea |
| L9110S | Module | 2 H-bridge | Amazon | $1.00/ea |

### Wire and Coil Materials

| Item | Spec | Supplier | Price |
|------|------|----------|-------|
| Magnet wire | 32 AWG, 200ft | Amazon (Remington Industries) | $10 |
| Magnet wire | 36 AWG, 200ft | Amazon (Remington Industries) | $10 |
| Hookup wire | 28 AWG silicone, assorted colors | Amazon | $15 |

### Power

| Item | Spec | Supplier | Price |
|------|------|----------|-------|
| LiPo (prototyping) | 3.7V 150mAh, JST-PH | Adafruit, Amazon | $3.00/ea |
| LiPo (tiny, 12mm cells) | 3.7V 40mAh thin cell | AliExpress, Adafruit | $2.00/ea |
| Supercap | 1F 5.5V radial | Mouser (Eaton HV series) | $2.00/ea |
| TP4056 | LiPo charge IC, SOT-23-6 | LCSC | $0.10/ea |
| Solar cell (future) | 5V 0.5W mini panel | Amazon, AliExpress | $3.00/ea |

### PCB Fabrication

| Service | What | Turnaround | Cost |
|---------|------|-----------|------|
| JLCPCB | PCB fabrication | 3-5 days + shipping | $2 for 5 boards (10×10cm) |
| JLCPCB | SMT assembly | 5-7 days + shipping | $8 setup + $0.003/joint |
| JLCPCB | Flex PCB | 7-10 days + shipping | $15 for 5 boards |
| PCBWay | Same services, alternative | Similar | Similar |
| LCSC | Components (pairs with JLCPCB) | Ships with PCB order | Cheap, huge selection |

### 3D Printers

| Model | Technology | Build Volume | Best For | Price |
|-------|-----------|-------------|----------|-------|
| Bambu Lab A1 Mini | FDM | 180×180×180mm | M1: first cells, PETG | $300 |
| Bambu Lab P1S | FDM (enclosed) | 256×256×256mm | M2-3: batch production, nylon | $600 |
| Bambu Lab X1C | FDM (enclosed, AMS) | 256×256×256mm | M3: carbon fiber PETG, multi-material | $1,000 |
| Elegoo Saturn 4 Ultra | MSLA resin | 218×123×220mm | 12mm cells: high precision | $400 |
| Formlabs Form 4 | SLA resin | 200×125×210mm | Best quality, engineering resins | $4,000 |

### Filament and Resin

| Material | Use Case | Product | Price |
|----------|----------|---------|-------|
| PETG | General prototyping, good flex life | Overture PETG | $20/kg |
| CF-PETG | Structural cells, stiffer | Bambu Lab CF-PETG | $35/kg |
| PA12-CF (Nylon+CF) | High-strength structural | Bambu Lab PA6-CF | $50/kg |
| TPU 95A | Flex zones only | Overture TPU | $25/kg |
| Tough resin | 12mm cells (SLA) | Elegoo ABS-Like Pro | $35/L |
| Engineering resin | High precision + strength | Formlabs Tough 2000 | $175/L |

---

## Appendix B: The Gradient Between Milestones

Each milestone has a clear goal, but the spaces between them are full of useful intermediate states. Here's what becomes possible at each order of magnitude:

### 10 cells
- Manual polygon assembly (triangle, square)
- Verify magnetic polarity conventions
- Test flex zone fatigue

### 50 cells
- Multiple polygon types in one structure
- First BLE mesh networking
- Autonomous coordinate assignment
- Simple peristalsis demo

### 200 cells
- Programmable stiffness (flex vs. rigid zones)
- First self-assembly station
- Impact distribution demo (drop a ball on it)
- "Caterpillar" locomotion across a table

### 500 cells
- Variable surface topology (flat → curved)
- Multi-polygon tiling patterns
- BLE mesh direction-finding (crude phased array)
- Enough compute for distributed sensor fusion

### 1,000 cells
- First useful echolocation (~10m range)
- Visible metamaterial effects (wave steering)
- Self-repair demo (remove cells, watch fabric heal)
- Enough cells for simple structural geometry (arch, dome)

### 5,000 cells
- Phased array gain measurable with SDR
- Distributed compute benchmark (parallelizable tasks)
- 3D structure assembly (not just 2D sheets)
- Weight: 0.4 kg at 12mm — light enough for wearable prototyping

### 10,000 cells
- All emergent properties demonstrable
- Echolocation range: ~30m
- Compute: 960 GHz aggregate
- Self-printing of T-bodies (with attached extruder)
- First flight experiment (if arm-scale cells)

### 65,000 cells
- Full demonstrator: all properties at operational strength
- Coupled operator-fabric system: body lattice (~12K cells) + backpack reserve (~53K)
- Cerebellar intelligence: SBC strategist + cluster coordinators + cell reflexes
- Kinesthetic interface: 10.8M sensor readings/sec input, 4,600 bits/sec kinesthetic output
- Deployable platform: scout drone + dynamic armor + comms + bridge + flight from one 10 kg system
- Onboard inference (3-7B model via SBC in backpack; cell reflex policies handle <1ms responses locally)
- Phased array: 53+ dBi (hundreds of km communication range)
- Echolocation: ~100m range
- Self-sustaining (solar powered, self-repairing, self-assembling)

---

## Appendix C: Electrohydrodynamic Thrust (Property #12)

**Status**: Plausible with one design modification (embedded corona wire at stem tips).

### Principle
Corona discharge at a sharp emitter ionizes air. Ions accelerate toward a collector, dragging neutral air molecules with them → bulk airflow → thrust. MIT demonstrated ionic flight in 2018.

### What the Fabric Has
- **Voltage generation**: Cells in series act as Marx generator. 500 cells × 30V = 15 kV. Corona onset at a 0.1mm point: ~1-3 kV. Achievable.
- **Air gap**: Stem length provides natural emitter-to-collector distance (5-44mm).
- **Distributed area**: Thousands of micro-thrusters across a wing's trailing edge.

### What the Fabric Needs (Design Modification)
- **Sharp emitter**: Corona discharge requires tip radius < 0.1mm. FDM can't print this. Solution: embed a 0.1mm tungsten or stainless steel wire segment in each EHD-designated stem tip during manufacturing. The wire protrudes 1-2mm from the stem end.
- Cost: ~$0.01/wire in bulk. Adds a component to the assembly process but not to the cell electronics.

### Performance Estimate

For a 200K-cell manta-ray wing at arm scale (4 kg):
```
EHD cells: 20,000 (10% of fabric)
Thruster chains: 40 chains of 500 cells in series
Voltage per chain: ~15 kV
Efficiency: ~3.2 N/kW (MIT's demonstrated figure)
Total EHD power: ~60 W
Total thrust: ~8 N

Weight: 39 N
Thrust/weight: 20%

For maintaining airspeed in level glide (5-10% drag compensation):
  Need 2-4 N → well within the 8 N capacity
```

**Verdict**: Silent, solid-state cruise propulsion for a gliding configuration. Not sufficient for takeoff or hovering. Supplemental to aerodynamic lift, not a replacement for it.

### Integration with Build Roadmap

EHD thrust is a Milestone 5+ feature. It requires:
- Large cell counts (500+ cells per thruster chain for adequate voltage)
- Manta-ray wing geometry (large surface area)
- Corona wire modification (manufacturing change)
- Not a priority for early milestones, but worth designing the stem-tip socket for future wire insertion starting at Milestone 3 (design-for-assembly phase)

---

*This document is maintained alongside the mathematical foundations and emergent capabilities specifications. As prototypes are built and tested, each milestone section will be updated with actual results, discovered issues, and revised plans.*

*See also:*
- *[MATHEMATICAL-FOUNDATIONS.md](./MATHEMATICAL-FOUNDATIONS.md) — Physics, axiom system, 9D coordinate space*
- *[DYNAMIC-COGNITION.md](./DYNAMIC-COGNITION.md) — Persistence Axiom, Cerebellar Model, operator-fabric coupling, kinesthetic interface, training protocol*
- *[EMERGENT-CAPABILITIES.md](./EMERGENT-CAPABILITIES.md) — 11+ zero-hardware capabilities with scaling analysis*
- *[T-PIECE-SPEC.md](./fabrication/T-PIECE-SPEC.md) — Cell geometry, connection zones, electrical contact architecture*
- *[MAGNETIC-MODEL.md](./physics/MAGNETIC-MODEL.md) — Force calculations, EPM specifications, switching physics*
