import * as THREE from 'three';
import { generateWave, MAX_WAVES } from './wavedata.js';

// Prototyp: Dummy-Denkmal (prozedural) + feste Slot-Ringe + 360-Spawns.
// Sobald Fotogrammetrie-Assets stehen, ersetzt ein GLB das Dummy-Denkmal (docs/ASSET-PIPELINE.md).

export const SPAWN_RADIUS = 15;
const MONUMENT_RADIUS = 2.2;

const stoneMat = new THREE.MeshStandardMaterial({ color: 0x8d9199, roughness: 0.95 });
const slotMat = new THREE.MeshStandardMaterial({ color: 0x2b3441, roughness: 0.85 });
const enemyMat = new THREE.MeshStandardMaterial({ color: 0x3c2f45, emissive: 0x120a1a, roughness: 0.7 });
const bossMat = new THREE.MeshStandardMaterial({ color: 0x8a2338, emissive: 0x400a12, roughness: 0.6 });

export function buildWorld(scene) {
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(17, 64),
    new THREE.MeshStandardMaterial({ color: 0x1a222c, roughness: 1.0 })
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

  // Dummy-Denkmal
  const monument = new THREE.Group();
  const base = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.6, 5.6), stoneMat);
  base.position.y = 0.3;
  const plinth = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.7, 2.8, 6), stoneMat);
  plinth.position.y = 2.0;
  const obelisk = new THREE.Mesh(new THREE.ConeGeometry(1.0, 4.2, 4), stoneMat);
  obelisk.position.y = 5.4;
  const crystal = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.6),
    new THREE.MeshStandardMaterial({ color: 0x5a86ff, emissive: 0x1d3fd6, emissiveIntensity: 1.0 })
  );
  crystal.position.y = 8.1;
  monument.add(base, plinth, obelisk, crystal);
  monument.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  scene.add(monument);

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

  return { monument, crystal, slots };
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
    const angle = Math.random() * Math.PI * 2;
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
            this.hud.banner('Denkmal verteidigt! Welle ' + MAX_WAVES + ' geschafft - New Game+ folgt.', 8000);
            this.hud.setState(this.state);
          } else {
            this.nextWave();
          }
        }
      }

      // Gegner laufen aufs Denkmal zu
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
          this.hud.banner('Das Denkmal ist gefallen ...', 8000);
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
