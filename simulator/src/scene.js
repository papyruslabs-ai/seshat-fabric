/**
 * Three.js scene setup — camera, lights, renderer, orbit controls.
 */

import * as THREE from 'three';

/**
 * Minimal orbit controls implementation.
 * Three.js addons require separate import paths that vary by bundler.
 * This self-contained version avoids the dependency.
 */
class OrbitControls {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;
    this.target = new THREE.Vector3(0, 0, 0);

    this._spherical = new THREE.Spherical();
    this._sphericalDelta = new THREE.Spherical();
    this._panOffset = new THREE.Vector3();
    this._scale = 1;
    this._rotateSpeed = 0.8;
    this._panSpeed = 0.5;
    this._zoomSpeed = 1.2;

    this._isDragging = false;
    this._isRightDrag = false;
    this._lastMouse = { x: 0, y: 0 };

    this._onMouseDown = this._onMouseDown.bind(this);
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onMouseUp = this._onMouseUp.bind(this);
    this._onWheel = this._onWheel.bind(this);
    this._onContextMenu = (e) => e.preventDefault();

    domElement.addEventListener('mousedown', this._onMouseDown);
    domElement.addEventListener('mousemove', this._onMouseMove);
    domElement.addEventListener('mouseup', this._onMouseUp);
    domElement.addEventListener('wheel', this._onWheel, { passive: false });
    domElement.addEventListener('contextmenu', this._onContextMenu);

    this.update();
  }

  _onMouseDown(e) {
    this._isDragging = true;
    this._isRightDrag = e.button === 2 || e.button === 1;
    this._lastMouse.x = e.clientX;
    this._lastMouse.y = e.clientY;
  }

  _onMouseMove(e) {
    if (!this._isDragging) return;

    const dx = e.clientX - this._lastMouse.x;
    const dy = e.clientY - this._lastMouse.y;
    this._lastMouse.x = e.clientX;
    this._lastMouse.y = e.clientY;

    const rect = this.domElement.getBoundingClientRect();

    if (this._isRightDrag) {
      // Pan
      const offset = new THREE.Vector3();
      offset.copy(this.camera.position).sub(this.target);
      const distance = offset.length();
      const factor = distance * this._panSpeed * 2 / rect.height;

      const right = new THREE.Vector3();
      right.setFromMatrixColumn(this.camera.matrix, 0);
      const up = new THREE.Vector3();
      up.setFromMatrixColumn(this.camera.matrix, 1);

      this._panOffset.addScaledVector(right, -dx * factor);
      this._panOffset.addScaledVector(up, dy * factor);
    } else {
      // Rotate
      this._sphericalDelta.theta -= (dx / rect.width) * Math.PI * this._rotateSpeed;
      this._sphericalDelta.phi -= (dy / rect.height) * Math.PI * this._rotateSpeed;
    }

    this.update();
  }

  _onMouseUp() {
    this._isDragging = false;
  }

  _onWheel(e) {
    e.preventDefault();
    if (e.deltaY < 0) {
      this._scale /= this._zoomSpeed;
    } else {
      this._scale *= this._zoomSpeed;
    }
    this.update();
  }

  update() {
    const offset = new THREE.Vector3();
    offset.copy(this.camera.position).sub(this.target);

    this._spherical.setFromVector3(offset);
    this._spherical.theta += this._sphericalDelta.theta;
    this._spherical.phi += this._sphericalDelta.phi;
    this._spherical.phi = Math.max(0.01, Math.min(Math.PI - 0.01, this._spherical.phi));
    this._spherical.radius *= this._scale;
    this._spherical.radius = Math.max(1, Math.min(500, this._spherical.radius));

    this.target.add(this._panOffset);

    offset.setFromSpherical(this._spherical);
    this.camera.position.copy(this.target).add(offset);
    this.camera.lookAt(this.target);

    this._sphericalDelta.set(0, 0, 0);
    this._panOffset.set(0, 0, 0);
    this._scale = 1;
  }

  dispose() {
    this.domElement.removeEventListener('mousedown', this._onMouseDown);
    this.domElement.removeEventListener('mousemove', this._onMouseMove);
    this.domElement.removeEventListener('mouseup', this._onMouseUp);
    this.domElement.removeEventListener('wheel', this._onWheel);
    this.domElement.removeEventListener('contextmenu', this._onContextMenu);
  }
}

/**
 * Initialize the Three.js scene.
 * @param {HTMLElement} container
 * @returns {{ scene, camera, renderer, controls, gridHelper }}
 */
export function createScene(container) {
  const width = container.clientWidth;
  const height = container.clientHeight;

  // Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x0a0a0f);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  // Scene
  const scene = new THREE.Scene();

  // Camera — positioned for viewing mm-scale objects
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.set(40, 30, 40);

  // Controls
  const controls = new OrbitControls(camera, renderer.domElement);

  // Lights
  const ambientLight = new THREE.AmbientLight(0x404060, 0.6);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.0);
  keyLight.position.set(50, 80, 50);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 2048;
  keyLight.shadow.mapSize.height = 2048;
  keyLight.shadow.camera.near = 0.5;
  keyLight.shadow.camera.far = 200;
  keyLight.shadow.camera.left = -50;
  keyLight.shadow.camera.right = 50;
  keyLight.shadow.camera.top = 50;
  keyLight.shadow.camera.bottom = -50;
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0x8888ff, 0.3);
  fillLight.position.set(-30, 20, -30);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0xff8844, 0.2);
  rimLight.position.set(0, -10, -40);
  scene.add(rimLight);

  // Grid helper (mm scale)
  const gridHelper = new THREE.GridHelper(100, 20, 0x222233, 0x161622);
  scene.add(gridHelper);

  // Axis helper
  const axisHelper = new THREE.AxesHelper(10);
  axisHelper.position.set(-50, 0, -50);
  scene.add(axisHelper);

  // Handle resize
  const onResize = () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };
  window.addEventListener('resize', onResize);

  return { scene, camera, renderer, controls, gridHelper, onResize };
}
