import * as THREE from 'three';
import { generateWave, MAX_WAVES } from './wavedata.js';
import { createGroundTexture, buildGravestones, buildTrees } from './ground.js';
import { applySkyBackground, applyGroundTexture, attachArtSprite, attachArtSprites } from './art.js';
import { ENEMY_TYPES, buildEnemyMesh } from './enemies.js';
import { rollPerkOptions } from './perks.js';
import { TOWER_TYPES, buildTowerMesh } from './towers.js';
import { saveRun, clearRun } from './save.js';

// Level L01 - Ender Dorfkirche:
// Verteidigungsziel ist der LOEWE auf dem Kriegerdenkmal (Zentrum der Arena).
// Die Dorfkirche steht als Kulisse am Kartenrand, ohne Verteidigungsrolle.
// Gegner-Roster: siehe src/enemies.js (8 Typen, Mech-Drache als Boss alle 10 Wellen).

export const SPAWN_RADIUS = 15;
const MONUMENT_RADIUS = 2.4;

// Denkmal-Selbstverteidigung (wie Evil Tower): Der Loewe feuert goldene Funken
// aus dem Waechterkristall und ist per Energie upgradbar.
// Kosten steigen je Stufe um den Faktor 1.6; Heilung repariert den Loewen.
const MONUMENT_UPGRADES = [
  { key: 'dmg', icon: '🔥', name: 'Golddornen', max: 10,
    level: (gm) => gm.monu.lvDmg,
    cost: (gm) => Math.round(15 * Math.pow(1.6, gm.monu.lvDmg)),
    desc: (gm) => 'Funken-Schaden ' + Math.round(gm.monu.dmg) + ' → ' + Math.round(gm.monu.dmg + 4) },
  { key: 'rate', icon: '⚡', name: 'Zorn des Löwen', max: 8,
    level: (gm) => gm.monu.lvRate,
    cost: (gm) => Math.round(20 * Math.pow(1.6, gm.monu.lvRate)),
    desc: (gm) => 'Schüsse/s ' + (1 / gm.monu.rate).toFixed(1) + ' → ' + (1 / (gm.monu.rate * 0.88)).toFixed(1) },
  { key: 'range', icon: '🌀', name: 'Wachender Funk', max: 6,
    level: (gm) => gm.monu.lvRange,
    cost: (gm) => Math.round(20 * Math.pow(1.6, gm.monu.lvRange)),
    desc: (gm) => 'Reichweite ' + gm.monu.range.toFixed(1) + ' → ' + (gm.monu.range + 0.9).toFixed(1) },
  { key: 'heal', icon: '🛡️', name: 'Steinmetz-Ruf', max: 999,
    level: () => 0,
    cost: () => 30,
    cant: (gm) => gm.hp >= gm.maxHp,
    desc: (gm) => 'Löwe heilt +150 LP (aktuell ' + Math.ceil(gm.hp) + ')' },
];

// Kirche steht hinten oben im Bild; in diesem Keil werden Spawns leicht verschoben,
// damit Gegner nicht IM Kirchengebaude spawnen (optisch sauber, es bleibt 360-Ansturm).
const CHURCH_ANGLE = Math.PI * 1.25;
const CHURCH_WEDGE = 0.65;

const stoneMat = new THREE.MeshStandardMaterial({ color: 0x9a9082, roughness: 0.95 });
const darkStoneMat = new THREE.MeshStandardMaterial({ color: 0x574a42, roughness: 0.8 });
const mossMat = new THREE.MeshStandardMaterial({ color: 0x55402c, roughness: 1.0 });
const lionMat = new THREE.MeshStandardMaterial({ color: 0xb59a62, roughness: 0.85 });
const brickMat = new THREE.MeshStandardMaterial({ color: 0x7a5644, roughness: 0.95 });
const roofMat = new THREE.MeshStandardMaterial({ color: 0x3d3336, roughness: 0.75, metalness: 0.15 });
const glassMat = new THREE.MeshStandardMaterial({ color: 0x352525, emissive: 0x5a3413, roughness: 0.4 });
const slotMat = new THREE.MeshStandardMaterial({ color: 0x403630, roughness: 0.85 });
const goldPadMat = new THREE.MeshStandardMaterial({ color: 0x8a6f33, roughness: 0.55, emissive: 0x2a1c05, emissiveIntensity: 0.7 });

// --- Platzhalter: Loewe auf dem Kriegerdenkmal ---
function buildLion() {
  const group = new THREE.Group();
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(3.3, 0.35, 3.3), darkStoneMat);
  plinth.position.y = 0.18;
  const pedestal = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.05, 2.8), stoneMat);
  pedestal.position.y = 0.85;
  const plaque = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.9, 0.1), darkStoneMat);
  plaque.position.set(0, 0.85, 1.46);
  const moss = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.18, 2.9), mossMat);
  moss.position.y = 1.44;

  const loewe = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.4, 1.15, 6, 12), lionMat);
  body.rotation.z = Math.PI / 2;
  body.position.set(-0.15, 1.78, 0);
  const mane = new THREE.Mesh(new THREE.SphereGeometry(0.42, 12, 10), lionMat);
  mane.scale.set(1.0, 1.15, 1.2);
  mane.position.set(0.58, 1.94, 0);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 10), lionMat);
  head.position.set(0.88, 2.0, 0);
  const snout = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.2, 0.28), lionMat);
  snout.position.set(1.1, 1.92, 0);
  const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.42, 8), lionMat);
  legL.position.set(0.5, 1.57, 0.17);
  const legR = legL.clone();
  legR.position.z = -0.17;
  const pawL = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.16, 8), lionMat);
  pawL.position.set(0.72, 1.34, 0.17);
  const pawR = pawL.clone();
  pawR.position.z = -0.17;
  const haunchL = new THREE.Mesh(new THREE.CapsuleGeometry(0.3, 0.35, 6, 10), lionMat);
  haunchL.rotation.z = Math.PI / 2;
  haunchL.position.set(-0.85, 1.8, 0.18);
  const haunchR = haunchL.clone();
  haunchR.position.z = -0.18;
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.55, 6), lionMat);
  tail.rotation.z = -1.2;
  tail.position.set(-1.05, 1.62, 0.12);
  loewe.add(body, mane, head, snout, legL, legR, pawL, pawR, haunchL, haunchR, tail);
  loewe.rotation.y = Math.PI * 0.12;

  group.add(plinth, pedestal, plaque, moss, loewe);
  group.userData.loewe = loewe; // Level-Art (assets/level/loewe.*) ersetzt spaeter die Figur
  return group;
}

// --- Platzhalter: Dorfkirche am Kartenrand (Kulisse, Backstein + Uhr + Schieferdach) ---
function buildChurch() {
  const church = new THREE.Group();
  const nave = new THREE.Mesh(new THREE.BoxGeometry(7.5, 4.5, 12), brickMat);
  nave.position.y = 2.25;
  const roofL = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.25, 12.6), roofMat);
  roofL.position.set(-1.75, 5.2, 0);
  roofL.rotation.z = 0.55;
  const roofR = roofL.clone();
  roofR.position.x = 1.75;
  roofR.rotation.z = -0.55;
  const ridge = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 12.6), roofMat);
  ridge.position.set(0, 6.35, 0);
  const tower = new THREE.Mesh(new THREE.BoxGeometry(3.2, 9.2, 3.2), brickMat);
  tower.position.set(0, 4.6, 0);
  const towerRoof = new THREE.Mesh(new THREE.ConeGeometry(2.7, 2.4, 4), roofMat);
  towerRoof.rotation.y = Math.PI / 4;
  towerRoof.position.set(0, 10.5, 0);
  const clock = new THREE.Mesh(new THREE.CircleGeometry(0.85, 24), darkStoneMat);
  clock.position.set(0, 8.4, 1.62);
  const door = new THREE.Mesh(new THREE.BoxGeometry(1.5, 2.3, 0.15), darkStoneMat);
  door.position.set(0, 1.15, 6.03);
  const windowL = new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.7, 0.1), glassMat);
  windowL.position.set(-2.4, 3.4, 6.02);
  const windowR = windowL.clone();
  windowR.position.x = 2.4;
  church.add(nave, roofL, roofR, ridge, tower, towerRoof, clock, door, windowL, windowR);

  church.scale.setScalar(0.85);
  church.position.set(Math.cos(CHURCH_ANGLE) * 16.5, 0, Math.sin(CHURCH_ANGLE) * 16.5);
  church.rotation.y = CHURCH_ANGLE; // Front zur Arena
  return church;
}

function spawnAngle() {
  let a = Math.random() * Math.PI * 2;
  const diff = Math.atan2(Math.sin(a - CHURCH_ANGLE), Math.cos(a - CHURCH_ANGLE));
  if (Math.abs(diff) < CHURCH_WEDGE) {
    a = CHURCH_ANGLE + (diff < 0 ? -CHURCH_WEDGE : CHURCH_WEDGE) + (Math.random() - 0.5) * 0.15;
  }
  return a;
}

export function buildWorld(scene) {
  // Blutmond-Nachthimmel als Hintergrund (assets/environment/himmel.*),
  // Fallback: einfarbiger Himmel wie bisher (Nebelfarbe bleibt #1a0c10)
  applySkyBackground(scene, ['assets/environment/himmel.png', 'assets/environment/himmel.svg'], 0x1a0c10);

  // Boden: Art-Textur (assets/environment/boden.*) wenn vorhanden,
  // sonst prozedurale Kirchhof-Textur (Rasen, Pflasterplatz, Laub, Vignette)
  const groundMat = new THREE.MeshStandardMaterial({ roughness: 0.95 });
  applyGroundTexture(groundMat, ['assets/environment/boden.png', 'assets/environment/boden.svg'], () => createGroundTexture(1024, 21));
  const ground = new THREE.Mesh(new THREE.CircleGeometry(21, 72), groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Spawn-Ring am Arenarand (360-Andeutung)
  const spawnRing = new THREE.Mesh(
    new THREE.RingGeometry(SPAWN_RADIUS + 0.4, SPAWN_RADIUS + 0.85, 96),
    new THREE.MeshBasicMaterial({ color: 0x9a2430, transparent: true, opacity: 0.75, side: THREE.DoubleSide })
  );
  spawnRing.rotation.x = -Math.PI / 2;
  spawnRing.position.y = 0.03;
  scene.add(spawnRing);

  // Loewe = Denkmal (= Verteidigungsziel) im Zentrum
  const monument = buildLion();
  monument.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  scene.add(monument);
  // Level-Art: Steinloewe als Sprite auf dem Sockel (Fallback: 3D-Platzhalter-Loewe)
  attachArtSprite(monument.userData.loewe, ['assets/level/loewe.png', 'assets/level/loewe.svg'], 1.3, { baseY: 1.44 });

  // Dorfkirche am Kartenrand, Kulisse
  const church = buildChurch();
  church.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  scene.add(church);
  // Umgebungs-Art: Kirche als Sprite (Fallback: 3D-Blockkirche)
  attachArtSprite(church, ['assets/environment/kirche.png', 'assets/environment/kirche.svg'], 9.2);

  // Grabsteine als Kirchhof-Kulisse im Aussenring
  const stones = buildGravestones(scene, CHURCH_ANGLE, CHURCH_WEDGE);
  attachArtSprites(stones, ['assets/environment/grabstein.png', 'assets/environment/grabstein.svg'], 1.35);

  // Kahle Baeume als Kulisse im Aussenring
  const trees = buildTrees(scene, CHURCH_ANGLE, CHURCH_WEDGE);
  attachArtSprites(trees, ['assets/environment/baum.png', 'assets/environment/baum.svg'], 4.6);

  // Wachterfunke ueber dem Loewen (leuchtet, dreht sich)
  const crystal = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.35),
    new THREE.MeshStandardMaterial({ color: 0xffd76a, emissive: 0xc2761d, emissiveIntensity: 1.2 })
  );
  crystal.position.set(0, 3.1, 0);
  scene.add(crystal);

  // Vier feste Turmplaetze nach den Himmelsrichtungen (Startaufstellung vor Welle 1)
  const pads = [];
  const padGeo = new THREE.CylinderGeometry(1.05, 1.25, 0.35, 10);
  const TOWER_PAD_RADIUS = 6.5;
  [
    { key: 'N', angle: -Math.PI / 2 },  // Norden (hinten)
    { key: 'O', angle: 0 },             // Osten (rechts)
    { key: 'S', angle: Math.PI / 2 },   // Sueden (vorn)
    { key: 'W', angle: Math.PI },       // Westen (links)
  ].forEach((dir) => {
    const pad = new THREE.Mesh(padGeo, slotMat);
    pad.position.set(Math.cos(dir.angle) * TOWER_PAD_RADIUS, 0.18, Math.sin(dir.angle) * TOWER_PAD_RADIUS);
    pad.receiveShadow = true;
    pad.userData.free = true;
    pad.userData.key = dir.key;
    scene.add(pad);
    pads.push(pad);
  });

  return { monument, church, crystal, pads };
}

export class Game {
  constructor(scene, world, hud) {
    this.scene = scene;
    this.world = world;
    this.hud = hud;
    this.maxHp = 1000;
    this.enemies = [];
    this.towers = [];
    this.projectiles = [];
    this.spawnQueue = [];
    this.reset(false); // Konstruktor wischt den gespeicherten Run NICHT
  }

  reset(clearSave = true) {
    if (clearSave) clearRun(); // Neustart: gespeicherten Run verwerfen
    for (const e of this.enemies) this.scene.remove(e.mesh);
    for (const t of this.towers) this.scene.remove(t.mesh);
    for (const p of this.projectiles) this.scene.remove(p.mesh);
    this.enemies = [];
    this.towers = [];
    this.projectiles = [];
    this.spawnQueue = [];
    this.removeExtraPad(); // Ehrenplatz ist Perk-abhaengig, gehoert nicht in einen frischen Run
    for (const pad of this.world.pads) pad.userData.free = true;
    this.wave = 0;
    this.ngPlus = 0; // New-Game+-Zyklen (0 = erster Durchgang)
    this.hp = this.maxHp;
    this.energy = 60;
    this.speed = 1;
    // Roguelite-Perks: Multiplikatoren wirken sofort auf alle Tuerme
    this.perk = { dmgMul: 1, rateMul: 1, rangeMul: 1, bountyMul: 1, waveBonus: 0, slow: 0, slowDur: 0, splash: false, splashRadius: 0, crit: 0 };
    this.chosenPerks = [];
    this.selectedTower = 'bolzen';
    // Denkmal-Selbstverteidigung: Goldfunken aus dem Waechterkristall (upgradbar)
    this.monu = { dmg: 6, rate: 1.0, range: 5.5, cool: 0.5, lvDmg: 0, lvRate: 0, lvRange: 0 };
    this.spawnTimer = 0;
    this.interWaveTimer = 0;
    this.waveData = null;
    this.waveCleared = true;
    this.state = 'ready';
    this.hud.setState(this.state);
    this.hud.sync(this);
  }

  // New Game+ (docs/BALANCING.md): Nach jedem vollen Zyklus (100 Wellen) startet
  // der State-Button den naechsten Zyklus. Angezeigt wird die Welle IM Zyklus.
  displayWave() {
    return Math.max(0, this.wave - MAX_WAVES * this.ngPlus);
  }

  startNewGamePlus() {
    if (this.state !== 'won') return;
    this.ngPlus += 1;
    this.waveCleared = true;
    this.interWaveTimer = 3;
    this.state = 'running';
    this.hud.setState(this.state);
    this.hud.banner('New Game+ ' + this.ngPlus + ': Gegner doppelt zaeh, schneller und haerter - Tuerme, Staerken und Denkmal-Upgrades bleiben!', 4600);
    this.hud.sync(this);
  }

  nextWave() {
    this.wave += 1;
    this.waveCleared = false;
    const wave = generateWave(this.wave);
    this.waveData = wave; // enthaelt label + spawnInterval (Wellen-Bild v2)
    this.spawnQueue = wave.enemies.slice();
    this.spawnTimer = 0;
    this.interWaveTimer = 4;
    let text = 'Welle ' + this.wave + '/' + MAX_WAVES + (wave.label ? ' - ' + wave.label : '');
    if (wave.isBoss) text = 'Welle ' + this.wave + ': Mech-Drache greift an!';
    else if (this.wave % 5 === 0) text = 'Welle ' + this.wave + ': Nach dieser Welle waehlst du eine Staerke!';
    this.hud.banner(text);
    this.hud.sync(this);
  }

  spawnEnemy(typeKey) {
    const t = ENEMY_TYPES[typeKey] || ENEMY_TYPES.skelett;
    const bossIndex = t.boss ? Math.max(1, Math.min(10, Math.floor(this.wave / 10))) : 1; // Cap 10: kein Monster-Wachstum ins Unermessliche
    const mesh = buildEnemyMesh(typeKey);
    const growth = t.boss ? 1 + (bossIndex - 1) * 0.12 : 1;
    mesh.scale.setScalar(t.scale * growth);

    // Ein zufaelliger Spawnwinkel (360-Ansturm), Kirche wird ausgespart
    const angle = spawnAngle();
    const r = SPAWN_RADIUS + (t.boss ? 0.7 : 0);
    mesh.position.set(Math.cos(angle) * r, t.float ? 0.35 : 0, Math.sin(angle) * r);

    // Blickrichtung zum Denkmal: Der Drache hat seine Front auf +X
    if (t.boss) {
      mesh.rotation.y = Math.PI - angle;
    } else {
      mesh.rotation.y = Math.PI - angle + (Math.random() - 0.5) * 0.4;
    }

    if (!t.float) {
      mesh.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    }
    this.scene.add(mesh);
    const hp = Math.round((t.hpBase + this.wave * t.hpPerWave) * (t.boss ? 1 + (bossIndex - 1) * 0.35 : 1) * Math.pow(2, this.ngPlus));
    const dmg = Math.round(t.dmg * (t.boss ? 1 + (bossIndex - 1) * 0.25 : 1) * Math.pow(1.5, this.ngPlus));
    this.enemies.push({ mesh, hp, speed: t.speed * (1 + 0.15 * this.ngPlus), dmg, bounty: t.bounty, boss: !!t.boss, float: !!t.float, slowT: 0, slowAmt: 0 });
  }

  // Ehrenplatz-Perk ('platz'): oeffnet einen 5., goldglitzernden Turmplatz im
  // Nordost (Keil zwischen N und O, Rand wie die Normalplaetze). Er ist der
  // EINZIGE Platz, der auch mitten im Run bebaut werden darf.
  get maxTowerSlots() {
    return this.world.pads.length;
  }

  hasOpenExtraPad() {
    return this.world.pads.some((p) => p.userData.extra && p.userData.free);
  }

  addExtraPad() {
    if (this.world.pads.some((p) => p.userData.extra)) return;
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.25, 0.35, 10), goldPadMat);
    const a = -Math.PI / 4; // zwischen N (-PI/2) und O (0)
    pad.position.set(Math.cos(a) * 6.5, 0.18, Math.sin(a) * 6.5);
    pad.receiveShadow = true;
    pad.userData.free = true;
    pad.userData.key = 'NO';
    pad.userData.extra = true;
    this.scene.add(pad);
    this.world.pads.push(pad); // Raycaster in main.js greift automatisch zu
  }

  removeExtraPad() {
    const i = this.world.pads.findIndex((p) => p.userData.extra);
    if (i >= 0) {
      this.scene.remove(this.world.pads[i]);
      this.world.pads.splice(i, 1);
    }
  }

  // Baut einen Turm auf einen Platz (ohne Pruefung, ohne Kosten): genutzt von
  // placeTower (Spielzug) und restore (Wiederaufbau aus dem Checkpoint).
  buildTowerAt(pad, typeKey) {
    const t = TOWER_TYPES[typeKey] || TOWER_TYPES.bolzen;
    pad.userData.free = false;
    pad.userData.tower = typeKey;
    const tower = buildTowerMesh(typeKey);
    tower.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    tower.position.copy(pad.position);
    this.scene.add(tower);
    // Basiswerte; Perk-Multiplikatoren werden zur Schusszeit angewandt
    this.towers.push({
      mesh: tower, head: tower.userData.head, cool: 0,
      key: typeKey, padKey: pad.userData.key,
      dmg: t.dmg, rate: t.rate, range: t.range,
      splash: t.splash, splashRadius: t.splashRadius, slow: t.slow, slowDur: t.slowDur,
    });
    this.hud.sync(this);
  }

  // Turmbau nur im Aufbau (state ready): Platz N/O/S/W + gewaehlter Turmtyp.
  // Nach dem Start stehen die 4 Tuerme fuer das ganze Level fest (Entscheidung = Strategie).
  placeTower(pad) {
    const t = TOWER_TYPES[this.selectedTower] || TOWER_TYPES.bolzen;
    // Normalplaetze N/O/S/W: nur im Aufbau vor Welle 1. Der goldene Ehrenplatz
    // (Perk) darf auch mitten im Run bebaut werden.
    const activeGame = this.state === 'ready' || this.state === 'running' || this.state === 'paused';
    const buildAllowed = this.state === 'ready' || (pad.userData.extra && activeGame);
    if (!buildAllowed || !pad.userData.free || this.energy < t.cost) {
      return false;
    }
    this.energy -= t.cost;
    this.buildTowerAt(pad, this.selectedTower);
    saveRun(this.serialize()); // auch den Aufbau gegen App-Kill sichern
    return true;
  }

  // --- Persistenz: Checkpoint nach jeder Welle (siehe src/save.js) ---
  serialize() {
    return {
      v: 1,
      wave: this.wave,
      ngPlus: this.ngPlus,
      hp: Math.ceil(this.hp),
      energy: Math.floor(this.energy),
      perk: this.perk,
      chosenPerks: this.chosenPerks,
      monu: this.monu,
      towers: this.towers.map((tw) => ({ pad: tw.padKey, type: tw.key })),
    };
  }

  restore(data) {
    this.reset(false); // interner Reset, Speicher nicht anfassen
    this.wave = data.wave || 0;
    this.ngPlus = typeof data.ngPlus === 'number' ? data.ngPlus : 0;
    this.hp = typeof data.hp === 'number' && data.hp > 0 ? data.hp : this.maxHp;
    this.energy = typeof data.energy === 'number' ? data.energy : 60;
    this.perk = Object.assign(this.perk, data.perk || {});
    this.chosenPerks = Array.isArray(data.chosenPerks) ? data.chosenPerks : [];
    this.monu = Object.assign(this.monu, data.monu || {});
    // Ehrenplatz-Perk: 5. Platz herstellen, BEVOR die Tuerme wiederaufgebaut werden
    if (this.chosenPerks.indexOf('platz') >= 0) this.addExtraPad();
    const savedTowers = Array.isArray(data.towers) ? data.towers : [];
    for (const saved of savedTowers) {
      const pad = this.world.pads.find((p) => p.userData.key === saved.pad);
      if (pad && pad.userData.free) this.buildTowerAt(pad, saved.type || 'bolzen');
    }
    this.waveCleared = true;
    this.interWaveTimer = 3;
    this.state = this.wave > 0 ? 'paused' : 'ready';
    this.hud.setState(this.state);
    this.hud.sync(this);
  }

  // Gibt true zurueck, wenn der Gegner den Treffer ueberlebt hat.
  damageEnemy(enemy, dmg) {
    enemy.hp -= dmg;
    if (enemy.hp <= 0) {
      this.energy += enemy.bounty * this.perk.bountyMul;
      const i = this.enemies.indexOf(enemy);
      if (i >= 0) this.enemies.splice(i, 1);
      this.scene.remove(enemy.mesh);
      this.hud.sync(this);
      return false;
    }
    return true;
  }

  removeEnemy(enemy) {
    const i = this.enemies.indexOf(enemy);
    if (i >= 0) this.enemies.splice(i, 1);
    this.scene.remove(enemy.mesh);
  }

  // --- Roguelite-Perks: alle 5 Wellen eine Stärke (1 aus 3) ---
  openPerkChoice() {
    this.state = 'perk';
    this.hud.setState(this.state);
    this.hud.showPerks(rollPerkOptions(this.chosenPerks), (perk) => this.pickPerk(perk));
  }

  pickPerk(perk) {
    perk.apply(this);
    this.chosenPerks.push(perk.id);
    this.state = 'running';
    this.interWaveTimer = Math.max(this.interWaveTimer, 3);
    this.hud.hidePerks();
    this.hud.setState(this.state);
    let bannerText = 'Staerke erwacht: ' + perk.name + ' (' + this.chosenPerks.length + '. Perk)';
    if (perk.id === 'platz') {
      bannerText = 'Ehrenplatz erwacht: 5. Turmplatz (Nordost) offen - Turmtyp unten waehlen, Platz antippen (10 Energie)';
    }
    this.hud.banner(bannerText, perk.id === 'platz' ? 4200 : 2600);
    this.hud.sync(this);
    saveRun(this.serialize());
  }

  // --- Denkmal-Upgrade-Panel (Evil-Tower-artig): pausiert die Simulation ---
  openMonument() {
    if (this.state !== 'ready' && this.state !== 'running' && this.state !== 'paused') return false;
    this.resumeState = this.state;
    this.state = 'monument';
    this.hud.setState(this.state);
    this.hud.showMonument(this.monumentOffers(), (key) => this.buyMonument(key), () => this.closeMonument());
    return true;
  }

  closeMonument() {
    this.state = this.resumeState || 'running';
    this.hud.hideMonument();
    this.hud.setState(this.state);
  }

  monumentOffers() {
    return MONUMENT_UPGRADES.map((cfg) => {
      const level = cfg.level(this);
      const cost = cfg.cost(this);
      const maxed = level >= cfg.max;
      const cant = cfg.cant ? cfg.cant(this) : false;
      return {
        key: cfg.key, icon: cfg.icon, name: cfg.name, desc: cfg.desc(this),
        cost, maxed, cant,
        disabled: maxed || cant || this.energy < cost,
      };
    });
  }

  buyMonument(key) {
    const off = this.monumentOffers().find((o) => o.key === key);
    if (!off || off.disabled) return;
    this.energy -= off.cost;
    if (key === 'dmg') { this.monu.dmg += 4; this.monu.lvDmg += 1; }
    if (key === 'rate') { this.monu.rate *= 0.88; this.monu.lvRate += 1; }
    if (key === 'range') { this.monu.range += 0.9; this.monu.lvRange += 1; }
    if (key === 'heal') { this.hp = Math.min(this.maxHp, this.hp + 150); }
    this.hud.sync(this);
    saveRun(this.serialize());
    this.hud.showMonument(this.monumentOffers(), (k) => this.buyMonument(k), () => this.closeMonument());
  }

  update(dtRaw) {
    if (this.state === 'running') {
      const dt = Math.min(dtRaw, 0.05) * this.speed;

      // Wellen spawnen
      if (this.spawnQueue.length > 0) {
        this.spawnTimer -= dt;
        while (this.spawnQueue.length > 0 && this.spawnTimer <= 0) {
          this.spawnEnemy(this.spawnQueue.shift());
          this.spawnTimer += this.waveData ? this.waveData.spawnInterval : 0.5;
        }
      } else if (this.enemies.length === 0) {
        if (!this.waveCleared) {
          this.waveCleared = true;
          const reward = 12 + Math.floor(this.wave / 2) + this.perk.waveBonus;
          this.energy += reward;
          this.hud.banner('Welle ' + this.wave + ' geschafft (+' + reward + ' Energie)');
          this.hud.sync(this);
          saveRun(this.serialize()); // Checkpoint nach jeder Welle
          // Roguelite: Nach jeder 5. Welle oeffnet sich die Staerken-Wahl (1 aus 3)
          const dw = this.displayWave();
          if (dw % 5 === 0 && dw < MAX_WAVES) {
            this.openPerkChoice();
          }
        }
        this.interWaveTimer -= dt;
        if (this.interWaveTimer <= 0) {
          if (this.displayWave() >= MAX_WAVES) {
            this.state = 'won';
            // Checkpoint bleibt liegen: New Game+ baut auf dem Run weiter auf
            this.hud.banner('Loewe verteidigt! Zyklus geschafft - Button startet New Game+ (haerterer Ansturm, alles bleibt erhalten)', 8000);
            this.hud.setState(this.state);
          } else {
            this.nextWave();
          }
        }
      }

      // Gegner laufen auf den Loewen zu
      const reached = [];
      for (const enemy of this.enemies) {
        const dir = new THREE.Vector3(-enemy.mesh.position.x, 0, -enemy.mesh.position.z);
        const dist = dir.length();
        if (dist <= MONUMENT_RADIUS) {
          reached.push(enemy);
          continue;
        }
        dir.normalize();
        // Frostturm / Frosthauch: kurzzeitig verlangsamte Gegner
        if (enemy.slowT > 0) {
          enemy.slowT -= dt;
          enemy.mesh.position.addScaledVector(dir, enemy.speed * dt * (1 - (enemy.slowAmt || 0)));
          if (enemy.slowT <= 0) enemy.slowAmt = 0;
        } else {
          enemy.mesh.position.addScaledVector(dir, enemy.speed * dt);
        }
      }
      if (reached.length > 0) {
        for (const enemy of reached) {
          this.hp = Math.max(0, this.hp - enemy.dmg);
          this.removeEnemy(enemy);
        }
        this.hud.sync(this);
        if (this.hp <= 0) {
          this.state = 'lost';
          clearRun();
          this.hud.banner('Der Loewe ist gefallen ...', 8000);
          this.hud.setState(this.state);
        }
      }

      // Tuerme suchen Ziel und feuern
      for (const tower of this.towers) {
        tower.cool -= dt;
        if (tower.cool > 0) continue;
        const range = tower.range * this.perk.rangeMul;
        let target = null;
        let best = Infinity;
        for (const enemy of this.enemies) {
          const d = tower.mesh.position.distanceTo(enemy.mesh.position);
          if (d <= range && d < best) { best = d; target = enemy; }
        }
        if (!target) continue;
        tower.cool = tower.rate / this.perk.rateMul;
        tower.head.lookAt(target.mesh.position);
        let dmg = tower.dmg * this.perk.dmgMul;
        let crit = false;
        if (Math.random() < this.perk.crit) { dmg *= 2; crit = true; }
        const projColor = crit ? 0xfff2b0 : (tower.key === 'frost' ? 0x9fd9ff : tower.key === 'splitter' ? 0xff8a4a : 0xffd76a);
        const proj = new THREE.Mesh(
          new THREE.SphereGeometry(crit ? 0.24 : 0.16, 8, 8),
          new THREE.MeshBasicMaterial({ color: projColor })
        );
        proj.position.copy(tower.mesh.position);
        proj.position.y = 2.0;
        this.scene.add(proj);
        // Schusseffekte: Turm-Eigenwerte + globale Perk-Anteile
        const splashRadius = tower.splashRadius + this.perk.splashRadius;
        const splashFactor = tower.splash > 0 ? tower.splash : (this.perk.splash ? 0.5 : 0);
        const slowAmt = Math.max(tower.slow, this.perk.slow);
        const slowDur = slowAmt > 0 ? Math.max(tower.slowDur, this.perk.slowDur) : 0;
        this.projectiles.push({ mesh: proj, target, speed: 16, dmg, splashFactor, splashRadius, slowAmt, slowDur });
      }

      // Der Loewe wehrt sich selbst: goldene Funken aus dem Waechterkristall
      this.monu.cool -= dt;
      if (this.monu.cool <= 0) {
        let target = null;
        let best = Infinity;
        for (const enemy of this.enemies) {
          const d = enemy.mesh.position.length();
          if (d <= this.monu.range && d < best) { best = d; target = enemy; }
        }
        if (target) {
          this.monu.cool = this.monu.rate;
          const proj = new THREE.Mesh(
            new THREE.SphereGeometry(0.14, 8, 8),
            new THREE.MeshBasicMaterial({ color: 0xffd76a })
          );
          proj.position.set(0, 3.1, 0);
          this.scene.add(proj);
          this.projectiles.push({ mesh: proj, target, speed: 18, dmg: this.monu.dmg, splashFactor: 0, splashRadius: 0, slowAmt: 0, slowDur: 0 });
        } else {
          this.monu.cool = 0.2; // bald wieder pruefen
        }
      }

      // Projektile fliegen (homing)
      for (const proj of this.projectiles.slice()) {
        if (this.enemies.indexOf(proj.target) < 0) {
          this.scene.remove(proj.mesh);
          this.projectiles.splice(this.projectiles.indexOf(proj), 1);
          continue;
        }
        const dir = proj.target.mesh.position.clone().sub(proj.mesh.position);
        const step = proj.speed * dt;
        if (dir.length() <= step || dir.length() < 0.3) {
          const hitPos = proj.target.mesh.position.clone();
          this.damageEnemy(proj.target, proj.dmg);
          // Flaechenschaden: Splitterturm oder Sprengbolzen-Perk
          if (proj.splashFactor > 0) {
            for (const other of this.enemies.slice()) {
              if (other !== proj.target && other.mesh.position.distanceTo(hitPos) <= proj.splashRadius) {
                this.damageEnemy(other, proj.dmg * proj.splashFactor);
              }
            }
          }
          // Verlangsamung: Frostturm oder Frosthauch-Perk, wirkt im Treffer-Umfeld
          if (proj.slowAmt > 0) {
            const slowRadius = proj.splashRadius > 0 ? proj.splashRadius : 1.4;
            for (const other of this.enemies.slice()) {
              if (other.mesh.position.distanceTo(hitPos) <= slowRadius) {
                other.slowT = proj.slowDur;
                other.slowAmt = Math.max(other.slowAmt, proj.slowAmt);
              }
            }
          }
          this.scene.remove(proj.mesh);
          this.projectiles.splice(this.projectiles.indexOf(proj), 1);
        } else {
          proj.mesh.position.addScaledVector(dir.normalize(), step);
        }
      }
    }

    // Atmosphaere laeuft immer
    this.world.crystal.rotation.y += dtRaw * 0.8;
  }
}
