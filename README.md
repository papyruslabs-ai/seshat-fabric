# Seshat Fabric

**Programmable metamaterial via the Seshat 9D semantic framework.**

Seshat Fabric extends the same mathematical framework that governs [code analysis](https://github.com/papyruslabs-ai/seshat) and [drone swarms](https://github.com/papyruslabs-ai/seshat-swarm) into the domain of physical programmable materials.

## What Is This?

A swarm of identical T-shaped cells that magnetically connect to form reconfigurable surfaces and volumes. Not a static fabric — a structure that is always in motion, assembling and disassembling as needed.

Each cell runs a finite behavioral catalog lookup (O(1), no AI at runtime). The same generation formula applies:

```
γ(J, S, L) → Output
```

Where **J** = 9D semantic coordinates, **S** = configuration parameters, **L** = cell actuator commands.

## The T-Piece

One manufacturing template. One shape. Every configuration.

- **Crossbar**: Two endpoints + one long edge (forms polygon edges)
- **Stem**: Variable length, compliant mechanism, magnetic connector at tip
- 3 T-pieces → triangle, 6 T-pieces → hexagon
- Each piece has a UUID — individually addressable
- Open lattice structure (frame, not solid sheet)

## 9D Space for Physical Cells

| Dimension | Symbol | Physical Meaning |
|-----------|--------|-----------------|
| Struct | σ | Cell mode: rigid, flex, relay, attract, release, transit |
| Edges | ε | Neighbor graph (dynamic, self-discovered) |
| Data | δ | Stem extension, strain, temperature, field strength |
| Constraints | κ | Autonomy level: autonomous, directed, emergency, passive |
| Context | χ | Structural role: load-bearing, hinge, sensor, relay, reserve |
| Ownership | λ | Force ownership: absorbing, transmitting, idle |
| Traits | τ | Cell type: bare, camera, IMU, flex-joint |
| Runtime | ρ | Processor variant, magnet strength class |
| Semantics | Σ | Derived from neighbors + current objective |

## Key Properties

- **Magnetic peristalsis**: Pieces route through the structure via sequential magnet activation
- **Regenerative impact absorption**: Structure gains electrical energy when hit (Faraday's law)
- **Amoeboid locomotion**: Build at leading edge, reclaim from trailing edge
- **3D volume tiling**: Truncated octahedron packing for arbitrary 3D shapes
- **Deployable organs**: Temporary purpose-built structures (sails, fins, solar arrays)

## Project Structure

```
seshat-fabric/
├── docs/
│   ├── architecture/         # System design, 9D mapping, behavioral catalog
│   ├── physics/              # Magnetic models, power budget, force analysis
│   └── fabrication/          # T-piece specs, 3D printing, materials
├── simulator/                # Three.js interactive design tool
│   ├── src/                  # Application source
│   └── public/               # Static assets
├── PLANNING.md               # Phased build plan
├── CLAUDE.md                 # AI instance briefing
└── README.md                 # This file
```

## Relationship to Seshat Ecosystem

| Project | Domain | Scale | Status |
|---------|--------|-------|--------|
| [seshat](https://github.com/papyruslabs-ai/seshat) | Code analysis | Abstract | Production |
| [seshat-swarm](https://github.com/papyruslabs-ai/seshat-swarm) | Drone coordination | Meters | Planning |
| **seshat-fabric** | Programmable material | Millimeters | Conceptual + Simulator |

All three share: 9D semantic space, finite behavioral catalog, selection-not-generation, blast-radius propagation (Theorem 9.4).

## Current Phase

Building the **Simulator** — an interactive Three.js tool for:
1. Parametric T-piece design with STL export
2. Assembly sandbox (snap pieces into polygons, visualize ε graph)
3. Magnetic force modeling and impact wave propagation
4. Power budget calculator
5. Behavioral catalog state machine viewer

## License

MIT
