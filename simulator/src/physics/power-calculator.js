/**
 * Power Budget Calculator — computes per-cell power consumption and generation.
 *
 * Uses real component specifications and physics constants.
 * All power values in milliwatts (mW), energy in millijoules (mJ).
 */

// --- MCU power profiles ---
const MCU_PROFILES = {
  esp32c3: {
    name: 'ESP32-C3',
    sleepCurrent_uA: 5,
    activeCurrent_mA: 5,
    voltage: 3.3,
    bleTxCurrent_mA: 8,
    clockMHz: 160,
  },
  rp2040: {
    name: 'RP2040',
    sleepCurrent_uA: 0.18,
    activeCurrent_mA: 3.4,
    voltage: 3.3,
    bleTxCurrent_mA: 0, // No built-in BLE
    clockMHz: 133,
  },
  attiny85: {
    name: 'ATtiny85',
    sleepCurrent_uA: 0.1,
    activeCurrent_mA: 1.5,
    voltage: 3.3,
    bleTxCurrent_mA: 0,
    clockMHz: 20,
  },
};

// --- Magnet specifications ---
const MAGNET_SPECS = {
  N35: { remanence: 1.19, maxTemp: 80, name: 'N35' },
  N42: { remanence: 1.30, maxTemp: 80, name: 'N42' },
  N52: { remanence: 1.45, maxTemp: 60, name: 'N52' },
};

// --- Solar cell efficiency ---
const SOLAR = {
  monocrystalline: 0.20,
  polycrystalline: 0.15,
  amorphous: 0.08,
};

// --- Physical constants ---
const IRRADIANCE = {
  indoor_dim: 100,     // lux → ~0.0001 W/cm² equivalent
  indoor_bright: 500,  // lux → ~0.0005 W/cm²
  outdoor_cloudy: 10000, // lux → ~0.01 W/cm²
  outdoor_sunny: 50000,  // lux → ~0.05 W/cm²
};

// Approximate lux to W/cm² (for silicon solar cells, ~1 lux ≈ 1 µW/cm² at solar spectrum)
function luxToWperCm2(lux) {
  return lux * 1e-6; // Very rough approximation
}

/**
 * Calculate complete power budget for a cell configuration.
 *
 * @param {object} config
 * @param {number} config.cbLength - Crossbar length (mm)
 * @param {string} config.processor - MCU type (esp32c3, rp2040, attiny85)
 * @param {string} config.magnetClass - Magnet grade (N35, N42, N52)
 * @param {number} config.magnetSize - Magnet diameter (mm)
 * @param {string} config.solarType - Solar cell type
 * @param {string} config.environment - Lighting environment
 * @param {number} config.magnetSwitchType - 'sma' or 'coil'
 * @returns {PowerBudgetResult}
 */
export function calculatePowerBudget(config) {
  const {
    cbLength = 25,
    processor = 'esp32c3',
    magnetClass = 'N42',
    magnetSize = 3,
    solarType = 'monocrystalline',
    environment = 'outdoor_sunny',
    magnetSwitchType = 'sma',
  } = config;

  const mcu = MCU_PROFILES[processor];
  const voltage = mcu.voltage;

  // === CONSUMPTION ===

  // Tier 1: Standby
  const tier1 = {
    mcuSleep: mcu.sleepCurrent_uA * voltage / 1000, // µA × V / 1000 = mW
    mcuWake: mcu.activeCurrent_mA * voltage * 0.001, // 0.1% duty cycle
    strainSense: 0.1 * voltage * 0.01, // 100µA, 1% duty
    neighborDetect: 0.05 * voltage * 0.005, // 50µA, 0.5% duty
  };
  tier1.total = tier1.mcuSleep + tier1.mcuWake + tier1.strainSense + tier1.neighborDetect;

  // Tier 2: Active
  const magnetSwitchPower = magnetSwitchType === 'sma'
    ? { current: 15, duty: 0.10, label: 'SMA release' }
    : { current: 10, duty: 0.20, label: 'Electromagnet' };

  const tier2 = {
    mcuActive: mcu.activeCurrent_mA * voltage,
    magnetSwitch: magnetSwitchPower.current * voltage * magnetSwitchPower.duty,
    communication: (mcu.bleTxCurrent_mA || 2) * voltage * 0.05,
    strainSense: 0.1 * voltage,
  };
  tier2.total = tier2.mcuActive + tier2.magnetSwitch + tier2.communication + tier2.strainSense;

  // Tier 3: High-intensity
  const tier3 = {
    mcuActive: mcu.activeCurrent_mA * voltage,
    rapidMagnet: 30 * voltage * 0.50, // 30mA, 50% duty
    highRateComm: (mcu.bleTxCurrent_mA || 2) * voltage * 0.30,
    fullSensors: 2 * voltage,
  };
  tier3.total = tier3.mcuActive + tier3.rapidMagnet + tier3.highRateComm + tier3.fullSensors;

  // === GENERATION ===

  // Solar
  const exposedArea_cm2 = (cbLength * cbLength * 0.3) / 100; // ~30% of cell face exposed
  const solarEfficiency = SOLAR[solarType] || 0.20;
  const irradiance = luxToWperCm2(IRRADIANCE[environment] || IRRADIANCE.outdoor_sunny);
  const solarPower_mW = exposedArea_cm2 * irradiance * solarEfficiency * 1000; // W to mW

  // Vibration harvesting (from power budget doc)
  // Very small at small cell sizes, proportional to magnet size and displacement
  const vibrationPower_mW = (magnetSize / 5) * (cbLength / 25) * 0.001; // ~1µW baseline for 25mm/5mm

  // Impact harvesting (per-event, not continuous)
  // P_harvest ≈ (BNA𝜔)² / (2R) from the magnetic model doc
  const B_r = MAGNET_SPECS[magnetClass]?.remanence || 1.3;
  const coilTurns = 30;
  const coilArea_m2 = (magnetSize / 2) * (magnetSize / 2) * Math.PI * 1e-6;
  const omega = 2 * Math.PI * 100; // 100 Hz impact frequency
  const displacement = 0.5e-3; // 0.5mm typical
  const coilR = 5; // ohms
  const impactPower_mW = Math.pow(B_r * 0.3 * coilTurns * coilArea_m2 * omega * displacement, 2) / (2 * coilR) * 1000;

  const generation = {
    solar: solarPower_mW,
    vibration: vibrationPower_mW,
    impactPerEvent: impactPower_mW, // mW during impact
  };

  // === BALANCE ===
  const balance = {
    tier1: solarPower_mW + vibrationPower_mW - tier1.total,
    tier2: solarPower_mW + vibrationPower_mW - tier2.total,
    tier3: solarPower_mW + vibrationPower_mW - tier3.total,
    tier1_selfSustaining: (solarPower_mW + vibrationPower_mW) >= tier1.total,
    tier2_selfSustaining: (solarPower_mW + vibrationPower_mW) >= tier2.total,
    tier3_selfSustaining: (solarPower_mW + vibrationPower_mW) >= tier3.total,
  };

  // === STORAGE ===
  // How long can a supercapacitor sustain each tier?
  const capSize_mF = cbLength >= 25 ? 100 : cbLength >= 12 ? 47 : 10; // mF, scales with cell size
  const capEnergy_mJ = 0.5 * capSize_mF * 1e-3 * voltage * voltage * 1000; // ½CV² in mJ

  const storage = {
    capacitance_mF: capSize_mF,
    energy_mJ: capEnergy_mJ,
    tier2_duration_s: capEnergy_mJ / tier2.total, // mJ / mW = seconds
    tier3_duration_s: capEnergy_mJ / tier3.total,
    recharge_from_solar_s: balance.tier1 > 0 ? capEnergy_mJ / (balance.tier1) : Infinity,
  };

  return {
    config: { cbLength, processor: mcu.name, magnetClass, magnetSize, solarType, environment },
    consumption: { tier1, tier2, tier3 },
    generation,
    balance,
    storage,
  };
}

/**
 * Render power budget results into the DOM.
 */
export function renderPowerBudget(result, containerId = 'power-results') {
  const el = document.getElementById(containerId);
  if (!el) return;

  const { consumption: c, generation: g, balance: b, storage: s, config } = result;

  const fmt = (v) => v < 0.01 ? v.toExponential(2) : v < 1 ? v.toFixed(3) : v.toFixed(1);
  const badge = (ok) => ok
    ? '<span style="color:#4aff8a">Self-sustaining</span>'
    : '<span style="color:#ff4a6a">Needs stored energy</span>';

  el.innerHTML = `
    <div class="power-section">
      <h4>Configuration</h4>
      <div class="info-row"><span>Cell size:</span><span>${config.cbLength}mm</span></div>
      <div class="info-row"><span>Processor:</span><span>${config.processor}</span></div>
      <div class="info-row"><span>Magnets:</span><span>${config.magnetClass} ${config.magnetSize}mm</span></div>
      <div class="info-row"><span>Environment:</span><span>${config.environment.replace('_', ' ')}</span></div>
    </div>

    <div class="power-section">
      <h4>Consumption</h4>
      <div class="info-row"><span>Tier 1 (standby):</span><span>${fmt(c.tier1.total)} mW</span></div>
      <div class="info-row"><span>Tier 2 (active):</span><span>${fmt(c.tier2.total)} mW</span></div>
      <div class="info-row"><span>Tier 3 (high):</span><span>${fmt(c.tier3.total)} mW</span></div>
    </div>

    <div class="power-section">
      <h4>Generation</h4>
      <div class="info-row"><span>Solar:</span><span>${fmt(g.solar)} mW</span></div>
      <div class="info-row"><span>Vibration:</span><span>${fmt(g.vibration)} mW</span></div>
      <div class="info-row"><span>Impact (during event):</span><span>${fmt(g.impactPerEvent)} mW</span></div>
    </div>

    <div class="power-section">
      <h4>Balance</h4>
      <div class="info-row"><span>Tier 1:</span><span>${badge(b.tier1_selfSustaining)} (${b.tier1 >= 0 ? '+' : ''}${fmt(b.tier1)} mW)</span></div>
      <div class="info-row"><span>Tier 2:</span><span>${badge(b.tier2_selfSustaining)} (${b.tier2 >= 0 ? '+' : ''}${fmt(b.tier2)} mW)</span></div>
      <div class="info-row"><span>Tier 3:</span><span>${badge(b.tier3_selfSustaining)} (${b.tier3 >= 0 ? '+' : ''}${fmt(b.tier3)} mW)</span></div>
    </div>

    <div class="power-section">
      <h4>Storage (${s.capacitance_mF}mF supercap)</h4>
      <div class="info-row"><span>Stored energy:</span><span>${fmt(s.energy_mJ)} mJ</span></div>
      <div class="info-row"><span>Tier 2 endurance:</span><span>${fmt(s.tier2_duration_s)} s</span></div>
      <div class="info-row"><span>Tier 3 endurance:</span><span>${fmt(s.tier3_duration_s)} s</span></div>
      <div class="info-row"><span>Recharge time (solar):</span><span>${s.recharge_from_solar_s === Infinity ? '∞' : fmt(s.recharge_from_solar_s) + ' s'}</span></div>
    </div>
  `;
}
