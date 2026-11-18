import * as THREE from 'three';
import { generateWave, MAX_WAVES } from './wavedata.js';
import { createGroundTexture, buildGravestones } from './ground.js';

// Level L01 - Ender Dorfkirche:
// Verteidigungsziel ist der LOEWE auf dem Kriegerdenkmal (Zentrum der Arena).
// Die Dorfkirche steht als Kulisse am Kartenrand, ohne Verteidigungsrolle.
// Alle Formen sind Platzhalter, bis die Fotogrammetrie-Assets stehen (docs/ASSET-PIPELINE.md).

export const SPAWN_RADIUS = 15;
const MONUMENT_RADIUS = 2.2;

// Kirche steht hinten oben im Bild; in diesem Keil werden Spawns leicht verschoben,
// damit Gegner nicht IM Kirchengebaude spawnen (optisch sauber, es bleibt 360-Ansturm).
const CHURCH_ANGLE = Math.PI * 1.25;
const CHURCH_WEDGE = 0.65;

const stoneMat = new THREE.MeshStandardMaterial({ color: 0x8d9199, roughness: 0.95 });
const darkStoneMat = new THREE.MeshStandardMaterial({ color: 0x4a4f5c, roughness: 0.8 });
const mossMat = new THREE.MeshStandardMaterial({ color: 0x39513a, roughness: 1.0 });
const lionMat = new THREE.MeshStandardMaterial({ color: 0xb3a284, roughness: 0.85 });
const brickMat = new THREE.MeshStandardMaterial({ color: 0x7a5644, roughness: 0.95 });
const roofMat = new THREE.MeshStandardMaterial({ color: 0x363b47, roughness: 0.75, metalness: 0.15 });
const glassMat = new THREE.MeshStandardMaterial({ color: 0x22283a, emissive: 0x0e1830, roughness: 0.4 });
const slotMat = new THREE.MeshStandardMaterial({ color: 0x2b3441, roughness: 0.85 });
const enemyMat = new THREE.MeshStandardMaterial({ color: 0x3c2f45, emissive: 0x120a1a, roughness: 0.7 });
const bossMat = new THREE.MeshStandardMaterial({ color: 0x8a2338, emissive: 0x400a12, roughness: 0.6 });

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
  // Boden mit prozeduraler Kirchhof-Textur (Rasen, Pflasterplatz, Laub, Vignette)
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(21, 72),
    new THREE.MeshStandardMaterial({ map: createGroundTexture(1024, 21), roughness: 0.95 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Spawn-Ring am Arenarand (360-Andeutung)
  const spawnRing = new THREE.Mesh(
    new THREE.RingGeometry(SPAWN_RADIUS + 0.4, SPAWN_RADIUS + 0.85, 96),
    new THREE.MeshBasicMaterial({ color: 0x6a2a3a, transparent: true, opacity: 0.55, side: THREE.DoubleSide })
  );
  spawnRing.rotation.x = -Math.PI / 2;
  spawnRing.position.y = 0.03;
  scene.add(spawnRing);

  // Loewe = Denkmal (= Verteidigungsziel) im Zentrum
  const monument = buildLion();
  monument.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  scene.add(monument);

  // Dorfkirche am Kartenrand, Kulisse
  const church = buildChurch();
  church.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  scene.add(church);

  // Grabsteine als Kirchhof-Kulisse im Aussenring
  buildGravestones(scene, CHURCH_ANGLE, CHURCH_WEDGE);

  // Wachterfunke ueber dem Loewen (leuchtet, dreht sich)
  const crystal = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.35),
    new THREE.MeshStandardMaterial({ color: 0x5a86ff, emissive: 0x1d3fd6, emissiveIntensity: 1.0 })
  );
  crystal.position.set(0, 3.1, 0);
  scene.add(crystal);

  // Feste Slot-Ringe um das Denkmal
  const slots = [];
  const slotGeo = new THREE.CylinderGeometry(0.8, 0.95, 0.35, 12);
  [
    { radius: 4.8, count: 10 },
    { radius: 8.6, count: 14 },
  ].forEach((ring, ringIndex) => {
    for (let i = 0; i < ring.count; i++) {
      const angle = (i / ring.count) * Math.PI * 2 + ringIndex * 0.3;
      const slot = new THREE.Mesh(slotGeo, slotMat);
      slot.position.set(Math.cos(angle) * ring.radius, 0.18, Math.sin(angle) * ring.radius);
      slot.receiveShadow = true;
      slot.userData.free = true;
      scene.add(slot);
      slots.push(slot);
    }
  });

  return { monument, church, crystal, slots };
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
    this.reset();
  }

  reset() {
    for (const e of this.enemies) this.scene.remove(e.mesh);
    for (const t of this.towers) this.scene.remove(t.mesh);
    for (const p of this.projectiles) this.scene.remove(p.mesh);
    this.enemies = [];
    this.towers = [];
    this.projectiles = [];
    this.spawnQueue = [];
    for (const slot of this.world.slots) slot.userData.free = true;
    this.wave = 0;
    this.hp = this.maxHp;
    this.energy = 60;
    this.speed = 1;
    this.spawnTimer = 0;
    this.interWaveTimer = 0;
    this.waveCleared = true;
    this.state = 'ready';
    this.hud.setState(this.state);
    this.hud.sync(this);
  }

  nextWave() {
    this.wave += 1;
    this.waveCleared = false;
    const wave = generateWave(this.wave);
    this.spawnQueue = wave.enemies.slice();
    this.spawnTimer = 0;
    this.interWaveTimer = 4;
    let text = 'Welle ' + this.wave + '/' + MAX_WAVES;
    if (wave.isBoss) text = 'Welle ' + this.wave + ': Denkmal-Verstaerkung!';
    else if (this.wave % 5 === 0) text = 'Welle ' + this.wave + ': Perk-Wahl (Platzhalter)';
    this.hud.banner(text);
    this.hud.sync(this);
  }

  spawnEnemy(spec) {
    const mesh = new THREE.Mesh(
      new THREE.ConeGeometry(spec.boss ? 1.1 : 0.55, spec.boss ? 3.2 : 1.6, 6),
      spec.boss ? bossMat : enemyMat
    );
    const angle = spawnAngle();
    const r = SPAWN_RADIUS + (spec.boss ? 0.7 : 0);
    mesh.position.set(Math.cos(angle) * r, spec.boss ? 1.6 : 0.8, Math.sin(angle) * r);
    mesh.castShadow = true;
    this.scene.add(mesh);
    this.enemies.push({ mesh, hp: spec.hp, speed: spec.speed, dmg: spec.dmg, boss: !!spec.boss });
  }

  placeTower(slot) {
    if ((this.state !== 'running' && this.state !== 'paused') || !slot.userData.free || this.energy < 10) {
      return false;
    }
    this.energy -= 10;
    slot.userData.free = false;
    const tower = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.68, 1.7, 8),
      new THREE.MeshStandardMaterial({ color: 0x4a5568, roughness: 0.6 })
    );
    body.position.y = 0.85;
    const head = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.45),
      new THREE.MeshStandardMaterial({ color: 0x7fb2ff, emissive: 0x2a5bd7, emissiveIntensity: 0.8 })
    );
    head.position.y = 2.0;
    tower.add(body, head);
    tower.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    tower.position.copy(slot.position);
    this.scene.add(tower);
    this.towers.push({ mesh: tower, head, cool: 0, range: 7.5, dmg: 4, rate: 0.75 });
    this.hud.sync(this);
    return true;
  }

  damageEnemy(enemy, dmg) {
    enemy.hp -= dmg;
    if (enemy.hp <= 0) {
      this.energy += enemy.boss ? 25 : 2;
      const i = this.enemies.indexOf(enemy);
      if (i >= 0) this.enemies.splice(i, 1);
      this.scene.remove(enemy.mesh);
      this.hud.sync(this);
    }
  }

  removeEnemy(enemy) {
    const i = this.enemies.indexOf(enemy);
    if (i >= 0) this.enemies.splice(i, 1);
    this.scene.remove(enemy.mesh);
  }

  update(dtRaw) {
    if (this.state === 'running') {
      const dt = Math.min(dtRaw, 0.05) * this.speed;

      // Wellen spawnen
      if (this.spawnQueue.length > 0) {
        this.spawnTimer -= dt;
        while (this.spawnQueue.length > 0 && this.spawnTimer <= 0) {
          this.spawnEnemy(this.spawnQueue.shift());
          this.spawnTimer += 0.5;
        }
      } else if (this.enemies.length === 0) {
        if (!this.waveCleared) {
          this.waveCleared = true;
          const reward = 12 + Math.floor(this.wave / 2);
          this.energy += reward;
          this.hud.banner('Welle ' + this.wave + ' geschafft (+' + reward + ' Energie)');
          this.hud.sync(this);
        }
        this.interWaveTimer -= dt;
        if (this.interWaveTimer <= 0) {
          if (this.wave >= MAX_WAVES) {
            this.state = 'won';
            this.hud.banner('Loewe verteidigt! Welle ' + MAX_WAVES + ' geschafft - New Game+ folgt.', 8000);
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
        enemy.mesh.position.addScaledVector(dir, enemy.speed * dt);
      }
      if (reached.length > 0) {
        for (const enemy of reached) {
          this.hp = Math.max(0, this.hp - enemy.dmg);
          this.removeEnemy(enemy);
        }
        this.hud.sync(this);
        if (this.hp <= 0) {
          this.state = 'lost';
          this.hud.banner('Der Loewe ist gefallen ...', 8000);
          this.hud.setState(this.state);
        }
      }

      // Tuerme suchen Ziel und feuern
      for (const tower of this.towers) {
        tower.cool -= dt;
        if (tower.cool > 0) continue;
        let target = null;
        let best = Infinity;
        for (const enemy of this.enemies) {
          const d = tower.mesh.position.distanceTo(enemy.mesh.position);
          if (d <= tower.range && d < best) { best = d; target = enemy; }
        }
        if (!target) continue;
        tower.cool = tower.rate;
        tower.head.lookAt(target.mesh.position);
        const proj = new THREE.Mesh(
          new THREE.SphereGeometry(0.16, 8, 8),
          new THREE.MeshBasicMaterial({ color: 0x9cc4ff })
        );
        proj.position.copy(tower.mesh.position);
        proj.position.y = 2.0;
        this.scene.add(proj);
        this.projectiles.push({ mesh: proj, target, speed: 16, dmg: tower.dmg });
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
          this.damageEnemy(proj.target, proj.dmg);
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
