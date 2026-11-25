import * as THREE from 'three';
import { createEngine } from './engine.js';
import { buildWorld, Game } from './game.js';
import { createHud } from './ui.js';
import { loadRun } from './save.js';

const canvas = document.getElementById('game');
const engine = createEngine(canvas);
const world = buildWorld(engine.scene);
const hud = createHud();
const game = new Game(engine.scene, world, hud);
hud.bindGame(game); // ui.js entscheidet damit selbst, ob die Turm-Leiste offen ist

hud.setState(game.state);
hud.sync(game);

// Gespeicherten Run wiederherstellen (App-Wechsel / WebView-Kill)
const saved = loadRun();
if (saved && (saved.wave > 0 || (saved.towers && saved.towers.length > 0))) {
  game.restore(saved);
  if (saved.wave > 0) {
    hud.banner('Run wiederhergestellt: nach Welle ' + saved.wave + ' - Weiter-Button startet die naechste Welle', 3400);
  } else {
    hud.banner('Aufbau wiederhergestellt: ' + (saved.towers ? saved.towers.length : 0) + '/4 Tuerme stehen', 2600);
  }
}

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
  if (game.state === 'perk') {
    hud.banner('Erst eine Staerke waehlen!', 1400);
    return;
  }
  if (game.state === 'monument') {
    game.closeMonument();
    return;
  }
  if (game.state === 'running') {
    game.state = 'paused';
  } else if (game.state === 'paused') {
    game.state = 'running';
  } else if (game.state === 'ready') {
    if (game.towers.length < 4) {
      hud.banner('Erst alle 4 Turmplaetze (N/O/S/W) besetzen!', 1600);
      return;
    }
    game.state = 'running';
    game.nextWave();
  } else if (game.state === 'won') {
    game.startNewGamePlus();
  } else {
    game.reset();
  }
  hud.setState(game.state);
  hud.sync(game);
});

// Turm-Typ waehlen (nur im Aufbau vor Welle 1 aktiv)
const towerBtns = Array.from(document.querySelectorAll('[data-tower]'));
for (const btn of towerBtns) {
  btn.addEventListener('click', () => {
    game.selectedTower = btn.dataset.tower;
    for (const b of towerBtns) b.classList.toggle('active', b === btn);
  });
}

// Denkmal-Button: oeffnet das Upgrade-Panel (pausiert)
const monumentBtn = document.getElementById('monument-btn');
monumentBtn.addEventListener('click', () => game.openMonument());

// Turmplatz N/O/S/W antippen = gewaehlten Turmtyp bauen; Denkmal antippen = Upgrades
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
canvas.addEventListener('pointerdown', (event) => {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, engine.camera);
  const hits = raycaster.intersectObjects(world.pads, false);
  if (hits.length > 0) {
    const hitPad = hits[0].object;
    // Ehrenplatz (Perk) darf auch mitten im Run bebaut werden, sonst nur im Aufbau
    const mayBuild = game.state === 'ready'
      || (hitPad.userData.extra && (game.state === 'running' || game.state === 'paused'));
    if (mayBuild) {
      if (!game.placeTower(hitPad)) {
        hud.banner('Platz belegt oder zu wenig Energie (10 benoetigt)', 1400);
      }
    } else {
      hud.banner('Tuerme stehen fest: Aufstellung nur vor Welle 1', 1400);
    }
  } else if (game.state === 'ready' || game.state === 'running' || game.state === 'paused') {
    // Denkmal antippen = Upgrade-Panel oeffnen
    const mh = raycaster.intersectObjects(world.monument.children, true);
    if (mh.length > 0) game.openMonument();
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
