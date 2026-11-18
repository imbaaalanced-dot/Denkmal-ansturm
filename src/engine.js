import * as THREE from 'three';

// Hybrid-Engine: echtes 3D (Three.js), HUD/2D-Effekte als HTML-Overlay (docs/ARCHITECTURE.md).
// Orthografische Isometrie-Kamera: passt die komplette 360-Arena automatisch ans Hochformat an.

export function createEngine(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a0c10);
  scene.fog = new THREE.Fog(0x1a0c10, 46, 100);

  const camera = new THREE.OrthographicCamera(-19, 19, 19, -19, 0.1, 220);
  camera.position.set(34, 38, 34);
  camera.lookAt(0, 2, 0);

  // Blutmond-Licht: rote Hemisphaere + Blutmond-Schatten + goldene Denkmal-Glut
  scene.add(new THREE.HemisphereLight(0x7a3a3a, 0x1a1014, 1.15));
  const moon = new THREE.DirectionalLight(0xe08a6a, 1.7);
  moon.position.set(-16, 26, -12);
  moon.castShadow = true;
  moon.shadow.mapSize.set(1024, 1024);
  moon.shadow.camera.left = -22;
  moon.shadow.camera.right = 22;
  moon.shadow.camera.top = 22;
  moon.shadow.camera.bottom = -22;
  moon.shadow.camera.far = 80;
  scene.add(moon);

  const crystalGlow = new THREE.PointLight(0xffc86a, 24, 16, 2);
  crystalGlow.position.set(0, 4, 0);
  scene.add(crystalGlow);

  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    const aspect = w / h;
    const arenaRadius = 19; // sichtbarer Mindest-Eckenabstand
    // Die kleinere Bildschirmachse zeigt mindestens den Arenaradius.
    if (aspect >= 1) {
      camera.top = arenaRadius;
      camera.bottom = -arenaRadius;
      camera.left = -arenaRadius * aspect;
      camera.right = arenaRadius * aspect;
    } else {
      camera.left = -arenaRadius;
      camera.right = arenaRadius;
      camera.top = arenaRadius / aspect;
      camera.bottom = -arenaRadius / aspect;
    }
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  resize();

  return { renderer, scene, camera };
}
