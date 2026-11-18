import * as THREE from 'three';
import { createEngine } from './engine.js';
import { buildWorld, Game } from './game.js';
import { createHud } from './ui.js';

const canvas = document.getElementById('game');
const engine = createEngine(canvas);
const world = buildWorld(engine.scene);
const hud = createHud();
const game = new Game(engine.scene, world, hud);

hud.setState(game.state);
hud.sync(game);

// Speed x1 / x2 / x3 / x5
const speedBtns = Array.from(document.querySelectorAll('[data-speed]'));
for (const btn of speedBtns) {
  btn.addEventListener('click', () => {
    game.speed = Number(btn.dataset.speed);
    for (const b of speedBtns) b.classList.toggle('active', b === btn);
  });
}

// Start / Pause / Neustart
const stateBtn = document.getElementById('state-btn');
stateBtn.addEventListener('click', () => {
  if (game.state === 'running') {
    game.state = 'paused';
  } else if (game.state === 'paused') {
    game.state = 'running';
  } else if (game.state === 'ready') {
    game.state = 'running';
    game.nextWave();
  } else {
    game.reset();
  }
  hud.setState(game.state);
  hud.sync(game);
});

// Slot antippen = Platzhalter-Turm bauen (10 Energie)
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
canvas.addEventListener('pointerdown', (event) => {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, engine.camera);
  const hits = raycaster.intersectObjects(world.slots, false);
  if (hits.length > 0 && !game.placeTower(hits[0].object)) {
    hud.banner('Slot belegt oder zu wenig Energie (10 benoetigt)', 1400);
  }
});

// WebView: automatische Pause bei App-Wechsel
document.addEventListener('visibilitychange', () => {
  if (document.hidden && game.state === 'running') {
    game.state = 'paused';
    hud.setState(game.state);
    hud.banner('Pausiert (App-Wechsel)', 1600);
  }
});

// Render-Loop
let last = performance.now();
engine.renderer.setAnimationLoop((now) => {
  const dt = Math.min((now - last) / 1000, 0.1);
  last = now;
  game.update(dt);
  engine.renderer.render(engine.scene, engine.camera);
});
