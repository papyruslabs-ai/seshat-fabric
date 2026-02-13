# Seshat Fabric — Build Plan

## Overview

This plan takes the project from concept to physical prototype through six phases.
Phases 1-4 are software-only. Phase 5 requires a 3D printer. Phase 6 adds electronics.

Each phase has clear deliverables and acceptance criteria. Phases can overlap.

---

## Phase 1: Mathematical Foundation
**Goal**: Formalize the 9D space for physical cells and define the behavioral catalog.

### Deliverables
1. **9D Fabric Space Specification** (`docs/architecture/9D-FABRIC-SPACE.md`)
   - Complete dimension definitions with value domains
   - Fiber bundle structure: which dimensions depend on which
   - Transition rules: valid σ → σ transitions
   - Comparison table: code domain vs. drone domain vs. fabric domain
   - Proof that fabric domain is a valid instantiation of the universal 𝕁 space

2. **Behavioral Catalog** (`docs/architecture/BEHAVIORAL-CATALOG.md`)
   - Enumerate all σ modes: rigid, flex, relay-receive, relay-pass, attract-home, release, in-transit
   - For each mode: preconditions, postconditions, ε requirements, power tier
   - Transition matrix: which mode transitions are valid
   - Compatibility matrix: which modes can coexist in adjacent cells
   - Catalog size estimate with proof of finiteness

3. **Assembly Protocol** (`docs/architecture/ASSEMBLY-PROTOCOL.md`)
   - Magnetic peristalsis routing algorithm
   - UUID-based piece addressing
   - Coordinator → cell command format (minimal bytes)
   - Self-healing protocol: detect damage → eject → route replacement
   - Shape morphing protocol: surplus region → deficit region without full disassembly

### Acceptance Criteria
- [ ] Every dimension has a finite, enumerable value domain
- [ ] Transition matrix covers all σ × σ pairs
- [ ] Assembly protocol is expressible as catalog entries (no runtime generation)
- [ ] Documents are internally consistent and cross-referenced

---

## Phase 2: Physics Models
**Goal**: Build the mathematical models that constrain physical design.

### Deliverables
1. **Magnetic Model** (`docs/physics/MAGNETIC-MODEL.md`)
   - Dipole-dipole force: F(d, m₁, m₂, θ) for neodymium magnets at target scales
   - Critical distance: at what cell size do individual dipoles merge into continuous field?
   - Switchable magnet model: electromagnet coil specs for on/off control
   - Connection strength vs. cell size curves (parametric)
   - Magnetic peristalsis: sequential activation timing, force profiles during transit

2. **Impact Absorption Model** (`docs/physics/IMPACT-ABSORPTION.md`)
   - Spring-mass lattice wave propagation over ε graph
   - Faraday harvesting per cell: E = ∫(BℓΔv)dt for given displacement
   - Absorption radius vs. impact energy (parametric)
   - Pre-rigidification response: sensor detection → stiffness gradient → optimized crumple zone
   - Comparison to conventional materials (Kevlar, carbon fiber, foam) at equivalent weight

3. **Power Budget** (`docs/physics/POWER-BUDGET.md`)
   - Per-cell power consumption by tier:
     - Tier 1 (standby): MCU sleep + periodic wake
     - Tier 2 (active): Magnet switching, sensor polling, communication
     - Tier 3 (high-intensity): Rapid reconfig, full sensor suite, locomotion
   - Per-cell power generation:
     - Solar: area per cell × efficiency × typical irradiance
     - Electromagnetic harvesting: ambient vibration spectrum → power
     - Impact harvesting: displacement energy → electrical energy
   - Balance analysis: which tiers are self-sustaining, which need stored energy
   - Battery/supercapacitor sizing per cell

4. **Locomotion Mechanics** (`docs/physics/LOCOMOTION.md`)
   - Contact mode spectrum: slug → centipede → tread → rolling
   - Speed vs. contact area relationship
   - Power consumption per mode
   - Terrain handling: flat, incline, vertical, overhang
   - Surface adhesion: cumulative magnetic friction model

### Acceptance Criteria
- [ ] All models use real physical constants (not placeholder values)
- [ ] Force curves are plotted for at least 3 magnet sizes (2mm, 5mm, 10mm)
- [ ] Power budget closes for at least one realistic cell configuration
- [ ] Impact model shows non-trivial absorption (>10% improvement over passive lattice)

---

## Phase 3: Simulator — T-Piece Designer
**Goal**: Build the interactive web tool for designing and exporting T-pieces.

### Tech Stack
- **Three.js** for 3D rendering
- **Vite** for build tooling
- **Vanilla JS/TS** (no framework overhead — this is a tool, not an app)

### Deliverables
1. **Parametric T-Piece Geometry**
   - Crossbar: length, width, thickness (slider controls)
   - Stem: min length, max length, width, taper
   - Magnet recesses: diameter, depth, placement (at endpoints + stem tip)
   - Compliance mechanism: flex zones, living hinges
   - Material thickness constraints (minimum printable wall)

2. **Live 3D Preview**
   - Orbit/zoom/pan camera controls
   - Wireframe + solid toggle
   - Dimension annotations on hover
   - Cross-section view for internal features (magnet recesses, flex zones)

3. **STL Export**
   - Export current design as STL for 3D printing
   - Export with supports pre-oriented for FDM printing
   - Batch export: generate N copies with alignment for print bed

4. **Preset Library**
   - "Arm-scale" preset (target: ~6mm crossbar, ~4mm stem)
   - "Tabletop demo" preset (target: ~25mm crossbar, ~15mm stem)
   - "Proof of concept" preset (target: ~50mm crossbar, oversize for testing)

### Acceptance Criteria
- [ ] Geometry is manifold (watertight) — STL passes mesh validation
- [ ] Minimum wall thickness enforced (no unprintable designs)
- [ ] 3 T-pieces visually snap into a triangle in the preview
- [ ] Exported STL opens correctly in PrusaSlicer/Cura

---

## Phase 4: Simulator — Assembly Sandbox
**Goal**: Interactive canvas for building structures from T-pieces.

### Deliverables
1. **2D Assembly Mode**
   - Place T-pieces on a flat canvas
   - Magnetic snap: pieces auto-align when within connection distance
   - Polygon detection: highlight when 3 pieces form a triangle, 6 form a hexagon
   - ε graph overlay: draw edges between connected pieces, color by connection strength
   - Multi-layer support: octagon+square tiling with lattice struts to second layer

2. **Routing Visualization**
   - Select a T-piece by UUID → highlight its current position
   - Define target position → show peristalsis route through structure
   - Animate piece movement along route (sequential magnet activation)
   - Show ε graph updates as piece moves (edges form/break)

3. **Force Visualization**
   - Apply simulated impact at a point → show force wave propagation
   - Color cells by stress level (green → yellow → red)
   - Show energy harvested per cell during impact event
   - Pre-rigidification preview: show stiffness gradient before impact arrives

4. **Behavioral State View**
   - Color each cell by current σ mode
   - Click cell to see full 9D coordinate
   - Step-through time: advance simulation one tick at a time
   - State machine diagram: show valid transitions from current mode

### Acceptance Criteria
- [ ] Can build a 6-cell hexagon by placing T-pieces
- [ ] ε graph correctly represents connectivity
- [ ] Impact wave propagates through at least 20 connected cells
- [ ] Routing animation shows piece moving through at least 5 intermediate positions

---

## Phase 5: Physical Prototype
**Goal**: Print and test T-pieces in the real world.

### Deliverables
1. **Print Run 1: Oversized Proof of Concept**
   - 50mm crossbar T-pieces (cheap FDM printer)
   - 18 pieces (enough for 3 hexagons or 6 triangles)
   - Press-fit 5mm neodymium magnets
   - Test: do pieces connect? Is connection strong enough to hold structure?
   - Test: does compliant stem work? Does it snap to correct length?

2. **Print Run 2: Refined Geometry**
   - Iterate on geometry based on Print Run 1 results
   - Test multi-layer assembly (octagon + lattice struts)
   - Test routing: can a piece slide through the structure?
   - Measure actual connection forces vs. model predictions

3. **Print Run 3: Scale Down**
   - Move to high-quality printer if available
   - 25mm crossbar, then 12mm, find minimum viable size
   - Document where physics model diverges from reality
   - Photograph and measure for calibration of simulator

### Acceptance Criteria
- [ ] At least one print run completes successfully
- [ ] Magnetic connection holds structure against gravity
- [ ] Stem compliance allows variable-length connections
- [ ] Simulator predictions within 30% of measured forces

---

## Phase 6: Electronics Integration
**Goal**: Add microcontrollers and make cells programmable.

### Deliverables
1. **Cell Electronics Spec**
   - MCU selection (likely ESP32-C3 or RP2040 at prototype scale)
   - Magnet driver circuit (H-bridge for electromagnet, or mechanical latch for permanent magnet)
   - Communication bus: magnetic connection as data line, or BLE mesh
   - Power: supercapacitor + solar cell + harvesting coil sizing
   - PCB layout fitting inside T-piece geometry

2. **Firmware**
   - Behavioral catalog in flash (same pattern as seshat-swarm)
   - UUID assignment and neighbor discovery
   - Command reception from coordinator
   - Sensor reading: stem extension, accelerometer, neighbor detection
   - σ mode transitions: receive command → lookup catalog → execute

3. **Coordinator Software**
   - Run on laptop/Raspberry Pi
   - Send assembly commands to cells
   - Monitor ε graph in real time
   - Integrate with simulator for digital twin

### Acceptance Criteria
- [ ] Single cell responds to on/off magnet commands
- [ ] Two cells discover each other as neighbors
- [ ] Coordinator can command a 6-cell hexagon assembly
- [ ] Power consumption measured and within budget model predictions

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-02-11 | New repo (not subdirectory of seshat-swarm) | Different physics domain, cleaner separation |
| 2026-02-11 | Three.js web app for simulator | Same stack as Hologram UI, runs in browser, STL export available |
| 2026-02-11 | Vanilla JS/TS, no framework | Tool, not app. Minimize dependencies. |
| 2026-02-11 | T-piece as universal cell shape | One manufacturing template, variable assembly |
| 2026-02-11 | Start with oversized pieces | Cheap printer, prove concept before investing |
| 2026-02-11 | Separate coordinator from cells | Cells are too small for intelligence. Selection, not generation. |

## Open Questions

1. **Magnet type**: Permanent (always on, need mechanical release) vs. electromagnetic (switchable, needs power)?
   - Hybrid possible: permanent for structure, electromagnetic for routing
2. **Communication protocol**: Through magnetic connections (wired) vs. BLE mesh (wireless)?
   - Wired is more reliable but adds complexity to connectors
3. **Minimum viable cell size**: What's the smallest printable T-piece with embedded magnets?
   - Depends on printer resolution and magnet availability
4. **Operating temperature**: Neodymium magnets lose strength above 80°C. Is this a constraint?
   - For wearable use, body heat is ~37°C, so probably fine
5. **STL export orientation**: What's the optimal print orientation for T-pieces?
   - Crossbar flat on bed, stem vertical? Or crossbar vertical for better layer adhesion?
