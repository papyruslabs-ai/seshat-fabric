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
| EP_L | Endpoint Left | Left end of crossbar, magnetic connection point |
| EP_R | Endpoint Right | Right end of crossbar, magnetic connection point |
| CB_EDGE | Crossbar Edge | Long continuous edge of crossbar (forms polygon edges) |
| STEM | Stem | Variable-length member extending from crossbar center |
| ST_TIP | Stem Tip | Magnetic connector at end of stem |
| FLEX | Flex Zone | Compliant section of stem (allows length variation) |

## 2. Parametric Dimensions

### Core Parameters

| Parameter | Symbol | Range | Default (25mm) | Default (50mm) |
|-----------|--------|-------|-----------------|-----------------|
| Crossbar length | L_cb | 4-100 mm | 25 mm | 50 mm |
| Crossbar width | W_cb | 1-10 mm | 3 mm | 5 mm |
| Crossbar thickness | T_cb | 0.5-5 mm | 2 mm | 3 mm |
| Stem width | W_st | 1-8 mm | 2.5 mm | 4 mm |
| Stem min length | L_st_min | 2-40 mm | 5 mm | 10 mm |
| Stem max length | L_st_max | 4-60 mm | 15 mm | 25 mm |
| Stem thickness | T_st | 0.5-5 mm | 2 mm | 3 mm |
| Magnet diameter | D_mag | 1-10 mm | 3 mm | 5 mm |
| Magnet depth | H_mag | 0.5-5 mm | 1.5 mm | 2 mm |
| Wall thickness (min) | T_wall | ≥ 0.4 mm | 0.8 mm | 1.0 mm |

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

## 3. Magnetic Connection Points

Each T-piece has **3 magnetic connection points**:

### EP_L and EP_R (Crossbar Endpoints)

```
    ┌─────┐
    │  ○  │ ← Magnet recess (cylindrical bore)
    │     │    D_mag diameter, H_mag depth
    └─────┘
```

- Magnet orientation: axial (N-S along crossbar axis)
- EP_L and EP_R have **opposite polarity** (one N-out, one S-out)
- This ensures two T-pieces meeting endpoint-to-endpoint attract naturally
- Recess has slight interference fit (0.05mm smaller than magnet OD)

### ST_TIP (Stem Tip)

```
    │     │
    │  ○  │ ← Magnet recess at stem tip
    └─────┘
```

- Magnet orientation: axial (N-S along stem axis)
- Polarity convention: N-out (all stem tips same polarity)
- When 3+ stems meet at polygon center, alternating polarity achieved by rotation
- May need electromagnet here for routing (switchable)

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

## 6. Material Recommendations

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

## 7. Print Orientation

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

## 8. Quality Criteria

### Dimensional Tolerances

| Feature | Tolerance | Why |
|---------|-----------|-----|
| Crossbar length | ± 0.2mm | Must align with neighbors |
| Magnet recess diameter | + 0.05mm / - 0.00mm | Interference fit for magnets |
| Stem width | ± 0.15mm | Must slide through relay corridors |
| Flex zone thickness | ± 0.1mm | Affects spring constant |
| Overall flatness | < 0.3mm over crossbar | Connection quality |

### Functional Tests

1. **Snap test**: Two EP connections should click together audibly
2. **Flex test**: Stem extends to L_st_max and returns to L_st_min without permanent deformation
3. **Polygon test**: 3 pieces form triangle, 6 form hexagon, stems meet at center
4. **Hold test**: Hexagon holds together when lifted by one piece (structural integrity)
5. **Route test**: A loose piece can slide through a completed hexagon's center
