/**
 * Seshat Fabric Simulator — Main entry point.
 *
 * Wires together:
 * - Three.js scene (camera, lights, renderer)
 * - T-piece parametric geometry (live rebuild on slider change)
 * - Polygon preview (triangle, hexagon, square assembly)
 * - STL export
 * - Module tab switching
 */

import * as THREE from 'three';
import { createScene } from './scene.js';
import { buildTPiece, buildPolygonPreview, computeInfo, PRESETS, DEFAULTS } from './geometry/t-piece.js';
import { exportSTL, downloadSTL } from './export-stl.js';
import { AssemblySandbox } from './assembly/sandbox.js';
import { calculatePowerBudget, renderPowerBudget } from './physics/power-calculator.js';
import { computeForceCurve, compareMagnets, renderForceCurveChart, renderMagnetMetrics } from './physics/magnetic-model.js';

// --- State ---
let currentModule = 'designer';
let currentParams = { ...DEFAULTS };
let tPieceGroup = null;
let polygonGroup = null;
let wireframeOverlay = null;
let showPolygon = true;
let polygonType = 'hexagon';

// --- Scene init ---
const viewport = document.getElementById('viewport');
const { scene, camera, renderer, controls } = createScene(viewport);

// --- FPS counter ---
let frameCount = 0;
let lastFPSTime = performance.now();
const fpsEl = document.getElementById('status-fps');

// --- Build initial geometry ---
rebuildGeometry();

// --- Render loop ---
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);

  // FPS
  frameCount++;
  const now = performance.now();
  if (now - lastFPSTime >= 1000) {
    fpsEl.textContent = `${frameCount} fps`;
    frameCount = 0;
    lastFPSTime = now;
  }
}
animate();

// --- Geometry rebuild ---
function rebuildGeometry() {
  // Remove old
  if (tPieceGroup) {
    scene.remove(tPieceGroup);
    disposeGroup(tPieceGroup);
  }
  if (polygonGroup) {
    scene.remove(polygonGroup);
    disposeGroup(polygonGroup);
  }
  if (wireframeOverlay) {
    scene.remove(wireframeOverlay);
    disposeGroup(wireframeOverlay);
    wireframeOverlay = null;
  }

  // Build single T-piece (always visible)
  tPieceGroup = buildTPiece(currentParams);
  // Position the single piece off to the side when polygon is shown
  if (showPolygon) {
    tPieceGroup.position.set(-currentParams.cbLength * 1.5, 0, 0);
  }
  scene.add(tPieceGroup);

  // Build polygon preview
  if (showPolygon) {
    polygonGroup = buildPolygonPreview(polygonType, currentParams);
    polygonGroup.position.set(currentParams.cbLength, 0, 0);
    scene.add(polygonGroup);
  }

  // Wireframe overlay
  if (document.getElementById('show-wireframe')?.checked) {
    wireframeOverlay = createWireframeOverlay(tPieceGroup);
    scene.add(wireframeOverlay);
  }

  // Update info panel
  updateInfo();
  updateStatus(`Rebuilt: ${polygonType} with ${currentParams.cbLength}mm crossbar`);
}

function createWireframeOverlay(source) {
  const group = source.clone();
  group.traverse((child) => {
    if (child.isMesh) {
      child.material = new THREE.MeshBasicMaterial({
        color: 0x4aff8a,
        wireframe: true,
        transparent: true,
        opacity: 0.4,
      });
    }
  });
  group.position.copy(source.position);
  return group;
}

function disposeGroup(group) {
  group.traverse((child) => {
    if (child.isMesh) {
      child.geometry.dispose();
      if (Array.isArray(child.material)) {
        child.material.forEach(m => m.dispose());
      } else {
        child.material.dispose();
      }
    }
  });
}

function updateInfo() {
  const info = computeInfo(currentParams);
  document.getElementById('info-volume').textContent = info.volume;
  document.getElementById('info-weight').textContent = info.weight;
  document.getElementById('info-stem-range').textContent = info.stemRange;
  document.getElementById('info-hex-radius').textContent = info.hexRadius;
  document.getElementById('info-stem-reaches').textContent = info.stemReaches;
}

function updateStatus(text) {
  document.getElementById('status-text').textContent = text;
}

// --- Slider bindings ---
const sliderMap = {
  'cb-length':     { key: 'cbLength',       display: 'val-cb-length' },
  'cb-width':      { key: 'cbWidth',        display: 'val-cb-width' },
  'cb-thickness':  { key: 'cbThickness',    display: 'val-cb-thickness' },
  'st-min':        { key: 'stMinLength',    display: 'val-st-min' },
  'st-max':        { key: 'stMaxLength',    display: 'val-st-max' },
  'st-width':      { key: 'stWidth',        display: 'val-st-width' },
  'mag-dia':       { key: 'magDiameter',    display: 'val-mag-dia' },
  'mag-depth':     { key: 'magDepth',       display: 'val-mag-depth' },
};

for (const [sliderId, { key, display }] of Object.entries(sliderMap)) {
  const el = document.getElementById(sliderId);
  if (!el) continue;

  el.addEventListener('input', () => {
    const val = parseFloat(el.value);
    currentParams[key] = val;
    document.getElementById(display).textContent = val;
    rebuildGeometry();
  });
}

// --- Preset buttons ---
document.querySelectorAll('.preset-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const presetName = btn.dataset.preset;
    const preset = PRESETS[presetName];
    if (!preset) return;

    currentParams = { ...preset };

    // Update all sliders
    for (const [sliderId, { key, display }] of Object.entries(sliderMap)) {
      const el = document.getElementById(sliderId);
      if (el && currentParams[key] !== undefined) {
        el.value = currentParams[key];
        document.getElementById(display).textContent = currentParams[key];
      }
    }

    rebuildGeometry();
    updateStatus(`Loaded preset: ${presetName}`);
  });
});

// --- Checkbox bindings ---
document.getElementById('show-wireframe')?.addEventListener('change', rebuildGeometry);
document.getElementById('show-magnets')?.addEventListener('change', () => {
  if (tPieceGroup) {
    const show = document.getElementById('show-magnets').checked;
    tPieceGroup.traverse((child) => {
      if (child.name.startsWith('magnet-')) {
        child.visible = show;
      }
    });
    if (polygonGroup) {
      polygonGroup.traverse((child) => {
        if (child.name.startsWith('magnet-')) {
          child.visible = show;
        }
      });
    }
  }
});

document.getElementById('show-polygon')?.addEventListener('change', (e) => {
  showPolygon = e.target.checked;
  rebuildGeometry();
});

document.getElementById('polygon-type')?.addEventListener('change', (e) => {
  polygonType = e.target.value;
  rebuildGeometry();
});

// --- Export ---
document.getElementById('export-stl')?.addEventListener('click', () => {
  const stlBuffer = exportSTL(tPieceGroup);
  const filename = `t-piece-${currentParams.cbLength}mm.stl`;
  downloadSTL(stlBuffer, filename);
  updateStatus(`Exported: ${filename}`);
});

document.getElementById('export-params')?.addEventListener('click', () => {
  const json = JSON.stringify(currentParams, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `t-piece-params-${currentParams.cbLength}mm.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  updateStatus('Exported parameters JSON');
});

// === Assembly Sandbox ===
const sandbox = new AssemblySandbox(scene, camera, renderer);

// Assembly panel bindings
document.getElementById('placement-type')?.addEventListener('change', (e) => {
  sandbox.placementType = e.target.value;
});

document.getElementById('show-edges')?.addEventListener('change', (e) => {
  sandbox.showEdges = e.target.checked;
  sandbox._render();
});

document.getElementById('show-modes')?.addEventListener('change', (e) => {
  sandbox.showModes = e.target.checked;
  sandbox._render();
});

document.getElementById('impact-force')?.addEventListener('input', (e) => {
  document.getElementById('val-impact-force').textContent = e.target.value;
});

document.getElementById('clear-impact')?.addEventListener('click', () => {
  sandbox.clearImpact();
  updateStatus('Impact cleared');
});

document.getElementById('cycle-mode')?.addEventListener('click', () => {
  if (sandbox.selectedUuid !== null) {
    sandbox.cycleMode(sandbox.selectedUuid);
    updateStatus(`Cycled mode for cell ${sandbox.selectedUuid}`);
  }
});

document.getElementById('reset-assembly')?.addEventListener('click', () => {
  sandbox.reset();
  updateStatus('Assembly reset');
});

// === Power Calculator ===
function updatePowerBudget() {
  const config = {
    cbLength: parseFloat(document.getElementById('power-cell-size')?.value || 25),
    processor: document.getElementById('power-processor')?.value || 'esp32c3',
    magnetClass: document.getElementById('power-magnet')?.value || 'N42',
    magnetSize: parseFloat(document.getElementById('power-mag-size')?.value || 3),
    environment: document.getElementById('power-environment')?.value || 'outdoor_sunny',
    magnetSwitchType: document.getElementById('power-switch')?.value || 'sma',
  };

  const result = calculatePowerBudget(config);
  renderPowerBudget(result);
}

document.getElementById('power-cell-size')?.addEventListener('input', (e) => {
  document.getElementById('val-power-cell').textContent = e.target.value;
  updatePowerBudget();
});
document.getElementById('power-processor')?.addEventListener('change', updatePowerBudget);
document.getElementById('power-magnet')?.addEventListener('change', updatePowerBudget);
document.getElementById('power-mag-size')?.addEventListener('input', (e) => {
  document.getElementById('val-power-mag-size').textContent = e.target.value;
  updatePowerBudget();
});
document.getElementById('power-environment')?.addEventListener('change', updatePowerBudget);
document.getElementById('power-switch')?.addEventListener('change', updatePowerBudget);

// === Magnetic Model ===
function updateMagneticModel() {
  const grade = document.getElementById('mag-grade')?.value || 'N42';
  const diameter = parseFloat(document.getElementById('mag-model-dia')?.value || 3);
  const height = parseFloat(document.getElementById('mag-height')?.value || 1.5);
  const compareAll = document.getElementById('mag-compare')?.checked;

  const canvas = document.getElementById('force-chart');
  if (!canvas) return;

  let curves;
  if (compareAll) {
    curves = compareMagnets([
      { grade: 'N35', diameter, height },
      { grade: 'N42', diameter, height },
      { grade: 'N52', diameter, height },
    ]);
  } else {
    curves = [computeForceCurve({ grade, diameter, height })];
  }

  renderForceCurveChart(canvas, curves);

  // Show metrics for the selected grade
  const selectedCurve = curves.find(c => c.grade === grade) || curves[0];
  renderMagnetMetrics(selectedCurve);
}

document.getElementById('mag-grade')?.addEventListener('change', updateMagneticModel);
document.getElementById('mag-model-dia')?.addEventListener('input', (e) => {
  document.getElementById('val-mag-model-dia').textContent = e.target.value;
  updateMagneticModel();
});
document.getElementById('mag-height')?.addEventListener('input', (e) => {
  document.getElementById('val-mag-height').textContent = e.target.value;
  updateMagneticModel();
});
document.getElementById('mag-compare')?.addEventListener('change', updateMagneticModel);

// --- Module tab switching ---
function switchModule(module) {
  const prevModule = currentModule;
  currentModule = module;

  // Update tab active state
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelector(`.tab[data-module="${module}"]`)?.classList.add('active');

  // Update panel visibility
  document.querySelectorAll('.panel-content').forEach(p => p.classList.remove('active'));
  const panel = document.getElementById(`${module}-panel`);
  if (panel) panel.classList.add('active');

  // Handle module activation/deactivation
  if (prevModule === 'assembly' && module !== 'assembly') {
    sandbox.deactivate();
    // Show designer geometry again
    rebuildGeometry();
  }

  if (module === 'assembly') {
    // Hide designer geometry, activate sandbox
    if (tPieceGroup) { scene.remove(tPieceGroup); }
    if (polygonGroup) { scene.remove(polygonGroup); }
    if (wireframeOverlay) { scene.remove(wireframeOverlay); }

    // Adjust camera for top-down view
    camera.position.set(0, 80, 0);
    camera.lookAt(0, 0, 0);
    controls.update();

    sandbox.params = { ...currentParams };
    sandbox.activate(viewport);
    updateStatus('Assembly Sandbox — click to place, shift+click to impact, right-click to inspect');
  } else if (module === 'designer') {
    // Reset camera for 3D view
    camera.position.set(40, 30, 40);
    camera.lookAt(0, 0, 0);
    controls.update();
  } else if (module === 'magnetic') {
    updateMagneticModel();
  } else if (module === 'power') {
    updatePowerBudget();
  }
}

document.querySelectorAll('.tab').forEach((tab) => {
  tab.addEventListener('click', () => switchModule(tab.dataset.module));
});
