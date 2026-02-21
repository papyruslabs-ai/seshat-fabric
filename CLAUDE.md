# Seshat Fabric — Instance Briefing

You are working on **seshat-fabric**, a programmable metamaterial system built on the Seshat 9D semantic framework.

## What You Need to Know

### The Framework (Proven in Code Domain)
- **JSTF-T 9D space**: 𝕁 = (σ, ε, δ, κ, χ, λ, τ, ρ, Σ) — universal intermediate representation
- **Behavioral catalog**: Finite set of patterns. Runtime is O(1) catalog lookup, not real-time computation.
- **Theorem 9.4 (Blast Radius)**: State changes propagate only to affected neighbors. O(|affected(e)| × h).
- **Empirical foundation**: 108,966 code entities → 2,571 core patterns (42.4× compression). Physical domain predicted even smaller.
- **Generation formula**: γ(J, S, L) → Output, where J = coordinates, S = style/config, L = target language/actuators.

### The Physical System
- **T-piece**: Universal cell shape. Crossbar (two endpoints + one edge) + variable-length stem with magnetic connector.
- 3 T-pieces → triangle, 6 → hexagon. One manufacturing template for all configurations.
- Each T-piece has a **UUID** — individually addressable.
- **Open lattice** — frame, not solid sheet. Gaps are features (solar exposure, weight, flexibility).
- Structure is **always in motion** — no "finished" state. Pieces continuously route via magnetic peristalsis.

### The Physics
- **Magnetic dipole force**: F(d) ≈ k/d⁴. Rapid falloff makes local interactions dominant.
- **Regenerative impact absorption**: Impact displaces cells through magnetic fields → induced current (Faraday). Structure gains energy when hit.
- **Three-tier power**: (1) Standby/harvesting, (2) Active/solar+harvesting, (3) High-intensity/burst.
- **ε graph IS the power grid**: Magnetic connections carry current between cells.

### 9D Mapping for Cells
| Dim | Code Domain | Fabric Domain |
|-----|-------------|---------------|
| σ | Function signature | Cell behavioral mode (rigid, flex, relay, attract, release, transit) |
| ε | Call graph edges | Neighbor graph (dynamic, self-discovered via magnetic coupling) |
| δ | Data types/mutations | Stem extension, strain, temperature, local field strength |
| κ | Constraints/invariants | Autonomy level (autonomous, directed, emergency, passive) |
| χ | Architectural context | Structural role (load-bearing, hinge, sensor, relay, reserve) |
| λ | Variable ownership | Force ownership (absorbing load, transmitting, idle) |
| τ | Type annotations | Cell hardware type (bare, camera, IMU, flex-joint) |
| ρ | Runtime target | Processor variant, magnet strength class |
| Σ | Semantic hash | Derived from neighbors + current objective |

## Principles

1. **Selection, not generation** — Each cell runs a catalog lookup. At sub-inch scales, you can't run complex computation. But you CAN run O(1) lookup.
2. **The ε graph IS the structure** — Physical connectivity = data connectivity = power connectivity. One graph.
3. **Geometry is a design parameter** — Triangles (rigidity), hexagons (isotropy), octagons+squares (multi-layer). Framework is geometry-agnostic.
4. **Power demand ∝ power supply** — Harder impacts generate more harvested energy. Self-balancing.
5. **Locomotion = reconfiguration** — Amoeboid movement is just building at front, reclaiming from back. Same primitive.

## Anti-Patterns

- **Don't hard-code hexagons** — The system supports triangles, hexagons, octagons, mixed tilings. ε is a graph, not a shape.
- **Don't assume static structure** — The fabric is always assembling/disassembling. "Finished" is not a state.
- **Don't run AI on cells** — Cells run catalog lookups. Intelligence lives in the coordinator, not the cell.
- **Don't ignore regenerative power** — Impact absorption is a power SOURCE, not just a structural feature.
- **Don't design for gaps** — Open lattice is intentional. Every cell gets solar exposure, airflow, weight savings.

## Key Documents
- `PLANNING.md` — Phased build plan
- `docs/architecture/9D-FABRIC-SPACE.md` — Complete 9D dimension specification
- `docs/architecture/BEHAVIORAL-CATALOG.md` — Cell behavioral modes and transitions
- `docs/physics/MAGNETIC-MODEL.md` — Force curves, field interactions, absorption waves
- `docs/physics/POWER-BUDGET.md` — Energy harvesting, consumption, and balance analysis
- `docs/physics/IMPACT-ABSORPTION.md` — Regenerative impact mechanics
- `docs/physics/SPRING-CATAPULT.md` — Octagon barrel spring acceleration (vs. magnetic coilgun)
- `docs/fabrication/T-PIECE-SPEC.md` — Geometry, materials, manufacturing constraints

## Simulator
The interactive Three.js tool lives in `simulator/`. It provides:
1. **T-Piece Designer** — Parametric geometry, live 3D preview, STL export
2. **Assembly Sandbox** — Snap pieces into polygons, see ε graph in real time
3. **Magnetic Model** — Force visualization, impact wave propagation over ε graph
4. **Power Calculator** — Energy budget given cell specs
5. **Catalog Viewer** — σ state machine with transitions

## Related Projects
- `seshat-converter` (same org) — The math foundation. JSTF-T 9D space, Theorem 9.4, proven on 34+ repos.
- `seshat-swarm` (same org) — Drone coordination. Same framework, physical domain, intermediate scale.
- Path: code (proven) → drones (planning) → fabric (this project, conceptual + simulator)
