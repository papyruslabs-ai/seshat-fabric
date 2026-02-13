/**
 * Magnetic Model — force curves, field visualization, and connection analysis.
 *
 * Uses the dipole-dipole force model with real neodymium magnet specifications.
 * Renders force-vs-distance charts as canvas-based plots.
 */

const MU_0 = 4 * Math.PI * 1e-7; // Permeability of free space (T·m/A)

// Magnet grades: remanence in Tesla
const GRADES = {
  N35: { Br: 1.19, name: 'N35', maxTemp: 80 },
  N42: { Br: 1.30, name: 'N42', maxTemp: 80 },
  N52: { Br: 1.45, name: 'N52', maxTemp: 60 },
};

/**
 * Calculate magnetic moment for a cylindrical magnet.
 * m = Br × V / µ₀
 * @param {number} Br - Remanence (T)
 * @param {number} diameter - mm
 * @param {number} height - mm
 * @returns {number} Magnetic moment (A·m²)
 */
function magneticMoment(Br, diameter, height) {
  const r = (diameter / 2) * 1e-3; // mm to m
  const h = height * 1e-3;
  const V = Math.PI * r * r * h; // Volume (m³)
  return Br * V / MU_0;
}

/**
 * Axial force between two identical cylindrical magnets.
 * F = (3µ₀ / 2π) × m₁ × m₂ / d⁴
 *
 * @param {number} m - Magnetic moment of each magnet (A·m²)
 * @param {number} d - Center-to-center distance (m)
 * @returns {number} Force (N)
 */
function dipoleForceSI(m, d) {
  if (d < 1e-6) return Infinity;
  return (3 * MU_0 / (2 * Math.PI)) * (m * m) / Math.pow(d, 4);
}

/**
 * Spring constant at equilibrium distance.
 * k = |dF/dd| = 4 × (3µ₀/2π) × m² / d⁵
 */
function springConstant(m, d) {
  if (d < 1e-6) return Infinity;
  return 4 * (3 * MU_0 / (2 * Math.PI)) * (m * m) / Math.pow(d, 5);
}

/**
 * Compute force curve data for plotting.
 *
 * @param {object} config
 * @param {string} config.grade - Magnet grade (N35, N42, N52)
 * @param {number} config.diameter - Magnet diameter (mm)
 * @param {number} config.height - Magnet height (mm)
 * @param {number} config.minDist - Minimum gap distance (mm), default 0.5
 * @param {number} config.maxDist - Maximum gap distance (mm), default 20
 * @param {number} config.steps - Number of data points, default 100
 * @returns {ForceCurveData}
 */
export function computeForceCurve(config) {
  const {
    grade = 'N42',
    diameter = 3,
    height = 1.5,
    minDist = 0.3,
    maxDist = 20,
    steps = 100,
  } = config;

  const Br = GRADES[grade]?.Br || 1.30;
  const m = magneticMoment(Br, diameter, height);

  const points = [];
  for (let i = 0; i <= steps; i++) {
    const distMM = minDist + (maxDist - minDist) * (i / steps);
    const distM = distMM * 1e-3 + (height * 1e-3); // Gap + half magnet each side
    const force = dipoleForceSI(m, distM);
    points.push({ distance: distMM, force });
  }

  // Key metrics
  const contactDist = 0.5; // mm gap at contact
  const contactForce = dipoleForceSI(m, (contactDist + height) * 1e-3);
  const k = springConstant(m, (contactDist + height) * 1e-3);
  const criticalDist = diameter * 3; // Field merging threshold

  return {
    grade: GRADES[grade].name,
    diameter,
    height,
    moment: m,
    points,
    metrics: {
      contactForce,
      springConstant: k,
      criticalDistance: criticalDist,
      breakawayEnergy: contactForce * contactDist * 1e-3 / 3, // Approximate integral
      maxTemp: GRADES[grade].maxTemp,
    },
  };
}

/**
 * Compare multiple magnet configurations.
 */
export function compareMagnets(configs) {
  return configs.map(c => computeForceCurve(c));
}

/**
 * Render force curve chart on a canvas element.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {ForceCurveData[]} curves - One or more curves to plot
 */
export function renderForceCurveChart(canvas, curves) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const pad = { top: 30, right: 20, bottom: 40, left: 60 };
  const plotW = W - pad.left - pad.right;
  const plotH = H - pad.top - pad.bottom;

  // Clear
  ctx.fillStyle = '#1e1e2a';
  ctx.fillRect(0, 0, W, H);

  // Find data range
  let maxForce = 0;
  let maxDist = 0;
  for (const curve of curves) {
    for (const p of curve.points) {
      if (p.force < 100) maxForce = Math.max(maxForce, p.force); // Cap extreme values
      maxDist = Math.max(maxDist, p.distance);
    }
  }
  maxForce = Math.ceil(maxForce * 10) / 10; // Round up

  // Grid
  ctx.strokeStyle = '#2a2a3a';
  ctx.lineWidth = 0.5;
  for (let i = 0; i <= 5; i++) {
    const y = pad.top + plotH * i / 5;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(pad.left + plotW, y);
    ctx.stroke();

    const x = pad.left + plotW * i / 5;
    ctx.beginPath();
    ctx.moveTo(x, pad.top);
    ctx.lineTo(x, pad.top + plotH);
    ctx.stroke();
  }

  // Axes
  ctx.strokeStyle = '#555568';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad.left, pad.top);
  ctx.lineTo(pad.left, pad.top + plotH);
  ctx.lineTo(pad.left + plotW, pad.top + plotH);
  ctx.stroke();

  // Labels
  ctx.fillStyle = '#8888a0';
  ctx.font = '11px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('Gap Distance (mm)', pad.left + plotW / 2, H - 5);

  ctx.save();
  ctx.translate(12, pad.top + plotH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('Force (N)', 0, 0);
  ctx.restore();

  // Tick labels
  ctx.textAlign = 'right';
  for (let i = 0; i <= 5; i++) {
    const val = maxForce * (1 - i / 5);
    ctx.fillText(val.toFixed(2), pad.left - 5, pad.top + plotH * i / 5 + 4);
  }
  ctx.textAlign = 'center';
  for (let i = 0; i <= 5; i++) {
    const val = maxDist * i / 5;
    ctx.fillText(val.toFixed(1), pad.left + plotW * i / 5, pad.top + plotH + 15);
  }

  // Plot curves
  const colors = ['#4a9eff', '#4aff8a', '#ffaa4a', '#ff4a6a'];
  for (let ci = 0; ci < curves.length; ci++) {
    const curve = curves[ci];
    const color = colors[ci % colors.length];

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();

    let started = false;
    for (const p of curve.points) {
      const x = pad.left + (p.distance / maxDist) * plotW;
      const y = pad.top + (1 - Math.min(p.force, maxForce) / maxForce) * plotH;

      if (!started) {
        ctx.moveTo(x, y);
        started = true;
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // Legend
    const ly = pad.top + 15 + ci * 18;
    ctx.fillStyle = color;
    ctx.fillRect(pad.left + 10, ly - 5, 12, 3);
    ctx.fillStyle = '#e0e0e8';
    ctx.textAlign = 'left';
    ctx.font = '11px monospace';
    ctx.fillText(`${curve.grade} ${curve.diameter}x${curve.height}mm (${curve.metrics.contactForce.toFixed(2)}N @ contact)`, pad.left + 28, ly);
  }

  // Title
  ctx.fillStyle = '#e0e0e8';
  ctx.font = '13px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Magnetic Force vs. Gap Distance', W / 2, 18);
}

/**
 * Render magnetic model metrics into the DOM.
 */
export function renderMagnetMetrics(curve, containerId = 'magnet-metrics') {
  const el = document.getElementById(containerId);
  if (!el) return;

  const m = curve.metrics;
  const fmt = (v) => v < 0.001 ? v.toExponential(2) : v < 1 ? v.toFixed(3) : v.toFixed(1);

  el.innerHTML = `
    <div class="info-row"><span>Contact force:</span><span>${fmt(m.contactForce)} N</span></div>
    <div class="info-row"><span>Spring constant:</span><span>${fmt(m.springConstant)} N/m</span></div>
    <div class="info-row"><span>Breakaway energy:</span><span>${fmt(m.breakawayEnergy * 1e6)} µJ</span></div>
    <div class="info-row"><span>Field merge dist:</span><span>${fmt(m.criticalDistance)} mm</span></div>
    <div class="info-row"><span>Max temperature:</span><span>${m.maxTemp}°C</span></div>
    <div class="info-row"><span>Moment:</span><span>${curve.moment.toExponential(2)} A·m²</span></div>
  `;
}
