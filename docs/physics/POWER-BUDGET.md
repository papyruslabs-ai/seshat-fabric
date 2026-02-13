# Power Budget Analysis

## 1. Per-Cell Power Consumption

### Tier 1: Standby (Harvesting Alone)

The cell is structural (rigid or idle), not actively switching magnets.

| Component | Current | Voltage | Power | Duty Cycle | Average |
|-----------|---------|---------|-------|------------|---------|
| MCU deep sleep | 5 μA | 3.3V | 16.5 μW | 100% | 16.5 μW |
| MCU periodic wake | 5 mA | 3.3V | 16.5 mW | 0.1% (wake 1ms every 1s) | 16.5 μW |
| Strain sensing | 100 μA | 3.3V | 330 μW | 1% (sample 10ms/s) | 3.3 μW |
| Neighbor detection | 50 μA | 3.3V | 165 μW | 0.5% | 0.8 μW |
| **Tier 1 Total** | | | | | **~37 μW** |

### Tier 2: Active (Harvesting + Solar)

Cell is actively participating in assembly, routing, or sensing.

| Component | Current | Voltage | Power | Duty Cycle | Average |
|-----------|---------|---------|-------|------------|---------|
| MCU active | 5 mA | 3.3V | 16.5 mW | 100% | 16.5 mW |
| Magnet switching (SMA) | 15 mA | 3.3V | 50 mW | 10% (switch 100ms/s) | 5 mW |
| Magnet switching (coil) | 10 mA | 3.3V | 33 mW | 20% | 6.6 mW |
| Communication | 8 mA | 3.3V | 26 mW | 5% (short bursts) | 1.3 mW |
| Strain sensing | 100 μA | 3.3V | 330 μW | 100% | 330 μW |
| **Tier 2 Total** | | | | | **~24 mW** |

### Tier 3: High-Intensity (Needs Burst Power)

Rapid reconfiguration, impact response, locomotion.

| Component | Current | Voltage | Power | Duty Cycle | Average |
|-----------|---------|---------|-------|------------|---------|
| MCU active | 5 mA | 3.3V | 16.5 mW | 100% | 16.5 mW |
| Rapid magnet switching | 30 mA | 3.3V | 100 mW | 50% | 50 mW |
| Communication (high rate) | 8 mA | 3.3V | 26 mW | 30% | 7.8 mW |
| Full sensor suite | 2 mA | 3.3V | 6.6 mW | 100% | 6.6 mW |
| Camera (if τ=camera) | 20 mA | 3.3V | 66 mW | 50% | 33 mW |
| **Tier 3 Total** | | | | | **~81 mW (114 mW with camera)** |

## 2. Per-Cell Power Generation

### Solar Harvesting

Each cell in the open lattice is partially exposed to light.

| Cell Size (crossbar) | Exposed Area | Solar Cell Efficiency | Indoor (500 lux) | Outdoor (50k lux) |
|----------------------|-------------|----------------------|-------------------|-------------------|
| 6mm | ~12 mm² | 20% (monocrystalline) | ~1.2 μW | ~120 μW |
| 12mm | ~48 mm² | 20% | ~4.8 μW | ~480 μW |
| 25mm | ~200 mm² | 20% | ~20 μW | ~2 mW |
| 50mm | ~800 mm² | 20% | ~80 μW | ~8 mW |

**Indoor**: Only sustains Tier 1 at 25mm+ cells.
**Outdoor**: Sustains Tier 1 easily. Tier 2 only at 50mm+ cells.
**Verdict**: Solar is supplementary, not primary, at small cell sizes.

### Electromagnetic Harvesting (Ambient Vibration)

Structure worn on body receives continuous low-frequency vibration (walking, breathing, gestures).

| Parameter | Value |
|-----------|-------|
| Typical body vibration | 1-10 Hz, 0.1-2 mm amplitude |
| Magnetic displacement per cell | ~0.05-0.5 mm |
| B field at coil | ~0.2 T |
| Coil turns | 30 |
| Coil area | 4 mm² |
| Coil resistance | 5 Ω |

```
P = (B × N × A × ω × x₀)² / (2R)
```

At 5 Hz, 0.2mm amplitude:
```
P = (0.2 × 30 × 4e-6 × 31.4 × 0.2e-3)² / (2 × 5)
P ≈ 0.014 μW per cell
```

**Verdict**: Ambient vibration harvesting is negligible at small cell sizes. Only meaningful at larger scales or higher vibration environments (e.g., mounted on machinery).

### Impact Harvesting (Burst Events)

From the magnetic model: ~0.35 mW per cell during impact, over ~20 cells.

| Impact Type | Duration | Cells Involved | Energy Harvested |
|-------------|----------|----------------|-----------------|
| Light touch | 10ms | 5 | 17.5 μJ |
| Moderate bump | 50ms | 20 | 350 μJ |
| Hard impact | 100ms | 50 | 1,750 μJ |
| Sustained vibration (1s) | 1000ms | 10 | 3,500 μJ |

**Verdict**: Impact harvesting is meaningful but intermittent. Good for topping off supercapacitors.

### Power Balance Summary

| Scenario | Generation | Consumption | Balance |
|----------|-----------|-------------|---------|
| 6mm cell, indoor, Tier 1 | ~1.2 μW (solar) | 37 μW | **-36 μW** (needs battery) |
| 6mm cell, outdoor, Tier 1 | ~120 μW (solar) | 37 μW | **+83 μW** (self-sustaining) |
| 25mm cell, indoor, Tier 1 | ~20 μW (solar) | 37 μW | **-17 μW** (close, needs supplement) |
| 25mm cell, outdoor, Tier 1 | ~2 mW (solar) | 37 μW | **+1.96 mW** (abundant) |
| 50mm cell, outdoor, Tier 2 | ~8 mW (solar) | 24 mW | **-16 mW** (needs battery for active) |
| 50mm cell, outdoor, Tier 2 + impact | ~8 mW + 0.35 mW × 20 | 24 mW | Still negative during active |

### Key Insight

**Tier 1 (standby) is self-sustaining outdoors at all cell sizes.**
**Tier 2 (active) requires stored energy even at 50mm cells.**
**Tier 3 (high-intensity) always requires burst from stored energy.**

This maps to the design: structure spends most of its time in Tier 1 (solar-sustained), with brief excursions to Tier 2-3 funded by supercapacitor reserves.

## 3. Energy Storage

### Supercapacitor Sizing

Target: sustain Tier 3 for 5 seconds (enough for impact response + routing several pieces).

```
E_needed = P_tier3 × t = 81 mW × 5s = 405 mJ = 0.405 J
```

Using 3.3V supercapacitor: C = 2E/V² = 2 × 0.405 / 3.3² = 74 mF

A 100mF ceramic supercapacitor:
- Size: ~5mm × 5mm × 2mm (fits in 25mm+ cells)
- Weight: ~0.3g
- Cost: ~$0.50 in volume

**Recharge time** from Tier 1 surplus (outdoor, 25mm cell):
```
t_recharge = E / P_surplus = 0.405 J / 1.96 mW = 207 seconds ≈ 3.5 minutes
```

**Verdict**: Supercapacitor provides 5 seconds of burst. Recharges in ~4 minutes from solar. This is a reasonable duty cycle for a structure that's mostly idle.

## 4. Cell Size Recommendations

| Cell Size | Use Case | Power Viability | Notes |
|-----------|----------|----------------|-------|
| 6mm | Wearable arm cover | Tier 1 outdoor only | Needs external power for active |
| 12mm | Dense flexible surface | Tier 1 outdoor, marginal indoor | Good balance of density and power |
| 25mm | Tabletop demo, testing | Tier 1 self-sustaining all conditions | Best for first prototype |
| 50mm | Proof of concept | Tier 1-2 outdoor viable | Easiest to build, oversized |

**Recommendation**: Start at 50mm (proof of concept), target 25mm (first useful prototype), aspire to 12mm (wearable).

## 5. Communication Power

### Through-Magnetic Communication

If ε connections carry data (modulated magnetic coupling):
- Bandwidth: Low (~1-10 kbps) but sufficient for 20-byte commands
- Power: Near zero (piggybacks on existing magnetic field)
- Range: Direct neighbors only (which is all we need — ε IS the network)
- Latency: ~1ms per hop

### BLE Mesh (Alternative)

If using wireless communication:
- Bandwidth: High (~1 Mbps)
- Power: 8-15 mA during TX/RX
- Range: 10-30m (wasteful for 6mm cell spacing)
- Latency: 10-50ms

**Verdict**: Through-magnetic communication for cell-to-cell. One BLE-equipped cell per ~50 cells as gateway to coordinator. This minimizes power while maintaining connectivity.
