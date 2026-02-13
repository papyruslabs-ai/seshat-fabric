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

import { createScene } from './scene.js';
import { buildTPiece, buildPolygonPreview, computeInfo, PRESETS, DEFAULTS } from './geometry/t-piece.js';
import { exportSTL, downloadSTL } from './export-stl.js';

// --- State ---
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

// --- Module tab switching ---
document.querySelectorAll('.tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    // Update tab active state
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    // Update panel visibility
    const module = tab.dataset.module;
    document.querySelectorAll('.panel-content').forEach(p => p.classList.remove('active'));
    const panel = document.getElementById(`${module}-panel`);
    if (panel) panel.classList.add('active');
  });
});
