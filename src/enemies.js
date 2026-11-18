import * as THREE from 'three';

// Gegner-Roster L01 - Referenzen: Marcels 8 Illustrationen (Nov 2026, siehe docs/ENEMIES.md).
// 3D-Platzhalter in Silhouetten-Logik: Ruestungsfarben, Groesse, Detailtreffer je Typ.
// Der Mech-Drache ist Boss: jede 10. Welle, er wächst mit jeder Bosswelle.

const boneMat = new THREE.MeshStandardMaterial({ color: 0xd8d2c0, roughness: 0.8 });
const ironMat = new THREE.MeshStandardMaterial({ color: 0x2f3040, roughness: 0.5, metalness: 0.4 });
const darkSteelMat = new THREE.MeshStandardMaterial({ color: 0x23232e, roughness: 0.45, metalness: 0.5 });
const leatherMat = new THREE.MeshStandardMaterial({ color: 0x5a3a2a, roughness: 0.9 });
const skinMat = new THREE.MeshStandardMaterial({ color: 0x9a7a5a, roughness: 0.8 });
const beardMat = new THREE.MeshStandardMaterial({ color: 0x6a4a2a, roughness: 1.0 });
const rockMat = new THREE.MeshStandardMaterial({ color: 0x5e6168, roughness: 1.0 });
const mossMat = new THREE.MeshStandardMaterial({ color: 0x3f5a3a, roughness: 1.0 });
const emberMat = new THREE.MeshStandardMaterial({ color: 0x9a4dff, emissive: 0x5a1df0, emissiveIntensity: 1.0 });
const ghostMat = new THREE.MeshStandardMaterial({ color: 0x8fb5d8, emissive: 0x2a4a7a, emissiveIntensity: 0.35, transparent: true, opacity: 0.55, roughness: 0.4 });
const ghostEyeMat = new THREE.MeshBasicMaterial({ color: 0xbfe0ff });
const dragonMat = new THREE.MeshStandardMaterial({ color: 0x3a4652, roughness: 0.45, metalness: 0.6 });
const dragonGlowMat = new THREE.MeshStandardMaterial({ color: 0xff6a2a, emissive: 0xd23a10, emissiveIntensity: 1.2 });
const hatMat = new THREE.MeshStandardMaterial({ color: 0x1e2026, roughness: 0.85 });
const featherMat = new THREE.MeshStandardMaterial({ color: 0xc03030, roughness: 0.8 });

// Werte = Platzhalter-Balancing (wird pro Level ausbalanciert, docs/ARCHITECTURE.md).
export const ENEMY_TYPES = {
  skelett: { name: 'Skelett-Soldat',    hpBase: 6,  hpPerWave: 0.6, speed: 1.5, dmg: 6,  bounty: 2,  scale: 1.0,
             sprite: 'assets/enemies/skelett.png', spriteH: 1.9 },
  pirat:   { name: 'Skelett-Pirat',     hpBase: 4,  hpPerWave: 0.5, speed: 2.2, dmg: 5,  bounty: 2,  scale: 0.95,
             sprite: 'assets/enemies/pirat.png', spriteH: 1.9 },
  geist:   { name: 'Nebel-Geist',       hpBase: 3,  hpPerWave: 0.4, speed: 2.6, dmg: 4,  bounty: 3,  scale: 1.0, float: true,
             sprite: 'assets/enemies/geist.png', spriteH: 2.1 },
  ritter:  { name: 'Ritter (Schwert)',  hpBase: 12, hpPerWave: 0.9, speed: 1.3, dmg: 9,  bounty: 3,  scale: 1.15,
             sprite: 'assets/enemies/ritter.png', spriteH: 2.2 },
  krieger: { name: 'Axt-Krieger',       hpBase: 10, hpPerWave: 0.8, speed: 1.8, dmg: 12, bounty: 4,  scale: 1.1,
             sprite: 'assets/enemies/krieger.png', spriteH: 2.2 },
  hammer:  { name: 'Ritter (Hammer)',   hpBase: 22, hpPerWave: 1.4, speed: 0.9, dmg: 18, bounty: 6,  scale: 1.35,
             sprite: 'assets/enemies/hammer.png', spriteH: 2.5 },
  golem:   { name: 'Felsen-Golem',      hpBase: 40, hpPerWave: 2.5, speed: 0.7, dmg: 20, bounty: 10, scale: 1.55,
             sprite: 'assets/enemies/golem.png', spriteH: 2.9 },
  drache:  { name: 'Mech-Drache (Boss)', hpBase: 70, hpPerWave: 5.0, speed: 0.8, dmg: 40, bounty: 25, scale: 2.0, boss: true,
             sprite: 'assets/enemies/drache.png', spriteH: 3.8 },
};

// --- Sprite-System: Marcels Illustrationen als Gegner (Fallback: 3D-Platzhalter) ---
// Assets: assets/enemies/<typ>.png (siehe Ordner-README dort).
// Der Bild-Hintergrund wird per Eckfarben-Keying automatisch transparent geschaltet,
// fehlt eine Datei, bleibt der 3D-Platzhalter einfach stehen (niemals ein Bruch).
const spriteCache = new Map();
const spriteLoader = new THREE.TextureLoader();

function makeTransparent(image) {
  const w = image.width;
  const h = image.height;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0);
  const data = ctx.getImageData(0, 0, w, h);
  const px = data.data;
  // Eckfarben = vermutlicher Hintergrund
  const corners = [0, (w - 1) * 4, (h - 1) * w * 4, ((h - 1) * w + (w - 1)) * 4];
  let r = 0, g = 0, b = 0;
  for (const c of corners) { r += px[c]; g += px[c + 1]; b += px[c + 2]; }
  r /= corners.length; g /= corners.length; b /= corners.length;
  const TOL = 70;
  for (let i = 0; i < px.length; i += 4) {
    const dr = px[i] - r, dg = px[i + 1] - g, db = px[i + 2] - b;
    if (dr * dr + dg * dg + db * db < TOL * TOL) px[i + 3] = 0;
  }
  ctx.putImageData(data, 0, 0);
  return canvas;
}

function attachSprite(texture, t, group) {
  const img = texture.image;
  const aspect = img.width > 0 && img.height > 0 ? img.width / img.height : 1;
  while (group.children.length > 0) group.remove(group.children[0]);
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: texture, transparent: true, alphaTest: 0.06 })
  );
  sprite.center.set(0.5, 0); // Illustration steht auf dem Boden
  const h = t.spriteH || 2.0;
  sprite.scale.set(h * aspect, h, 1);
  group.add(sprite);
}

function applySprite(typeKey, group) {
  const t = ENEMY_TYPES[typeKey];
  if (!t || !t.sprite) return;
  if (spriteCache.has(typeKey)) {
    const cached = spriteCache.get(typeKey);
    if (cached) attachSprite(cached, t, group);
    return; // laedt noch oder fehlt: Platzhalter bleibt
  }
  spriteCache.set(typeKey, null); // verhindert Doppelladen
  spriteLoader.load(
    t.sprite,
    (texture) => {
      try {
        const canvas = makeTransparent(texture.image);
        const canvasTexture = new THREE.CanvasTexture(canvas);
        canvasTexture.colorSpace = THREE.SRGBColorSpace;
        spriteCache.set(typeKey, canvasTexture);
        attachSprite(canvasTexture, t, group);
      } catch (err) {
        // Verarbeitung fehlgeschlagen: Platzhalter bleibt
      }
    },
    undefined,
    () => { /* Datei fehlt: Platzhalter bleibt, kein Fehler */ }
  );
}

function skeletonBase() {
  const g = new THREE.Group();
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.2, 0.7, 6), boneMat);
  torso.position.y = 0.9;
  const skull = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 0.24), boneMat);
  skull.position.y = 1.36;
  g.add(torso, skull);
  return g;
}

export function buildEnemyMesh(typeKey) {
  let g;
  switch (typeKey) {
    case 'pirat': {
      g = skeletonBase();
      const hat = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.14, 8), hatMat);
      hat.position.y = 1.53;
      const feder = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.22, 0.05), featherMat);
      feder.position.set(0.02, 1.7, 0);
      feder.rotation.z = -0.15;
      const saebel = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.5, 0.1), ironMat);
      saebel.position.set(0.26, 0.9, 0);
      saebel.rotation.z = -0.15;
      g.add(hat, feder, saebel);
      break;
    }
    case 'geist': {
      g = new THREE.Group();
      const nebel = new THREE.Mesh(new THREE.CapsuleGeometry(0.35, 0.6, 6, 12), ghostMat);
      nebel.position.y = 1.05;
      const augen = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), ghostEyeMat);
      augen.position.set(0, 1.35, 0.16);
      g.add(nebel, augen);
      break;
    }
    case 'ritter': {
      g = new THREE.Group();
      const torso = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.8, 0.32), ironMat);
      torso.position.y = 0.8;
      const helm = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.3), darkSteelMat);
      helm.position.y = 1.38;
      const schulterL = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), darkSteelMat);
      schulterL.position.set(-0.32, 1.2, 0);
      const schulterR = schulterL.clone();
      schulterR.position.x = 0.32;
      const schwert = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.85, 0.14), darkSteelMat);
      schwert.position.set(0.36, 1.05, 0);
      schwert.rotation.z = -0.25;
      g.add(torso, helm, schulterL, schulterR, schwert);
      break;
    }
    case 'krieger': {
      g = new THREE.Group();
      const torso = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.78, 0.34), leatherMat);
      torso.position.y = 0.78;
      const kopf = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), skinMat);
      kopf.position.y = 1.36;
      const bart = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.14), beardMat);
      bart.position.set(0, 1.28, 0.1);
      const stiel = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.8, 6), beardMat);
      stiel.position.set(0.36, 1.0, 0);
      stiel.rotation.z = -0.1;
      const klinge = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.22, 0.06), ironMat);
      klinge.position.set(0.42, 1.42, 0);
      g.add(torso, kopf, bart, stiel, klinge);
      break;
    }
    case 'hammer': {
      g = new THREE.Group();
      const torso = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.92, 0.44), darkSteelMat);
      torso.position.y = 0.86;
      const helm = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.32, 0.32), ironMat);
      helm.position.y = 1.5;
      const stiel = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.95, 6), beardMat);
      stiel.position.set(0.42, 1.1, 0);
      stiel.rotation.z = -0.08;
      const hammerkopf = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.24, 0.24), ironMat);
      hammerkopf.position.set(0.48, 1.52, 0);
      g.add(torso, helm, stiel, hammerkopf);
      break;
    }
    case 'golem': {
      g = new THREE.Group();
      const koerper = new THREE.Mesh(new THREE.IcosahedronGeometry(0.55, 0), rockMat);
      koerper.position.y = 1.05;
      const schulterL = new THREE.Mesh(new THREE.IcosahedronGeometry(0.28, 0), rockMat);
      schulterL.position.set(-0.55, 1.35, 0);
      const schulterR = schulterL.clone();
      schulterR.position.x = 0.55;
      const kopf = new THREE.Mesh(new THREE.IcosahedronGeometry(0.3, 0), rockMat);
      kopf.position.y = 1.85;
      const glutBrust = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 8), emberMat);
      glutBrust.position.set(0, 1.15, 0.45);
      const glutAuge = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), emberMat);
      glutAuge.position.set(0, 1.9, 0.26);
      const moos = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.14, 0.5), mossMat);
      moos.position.y = 1.62;
      g.add(koerper, schulterL, schulterR, kopf, glutBrust, glutAuge, moos);
      break;
    }
    case 'drache': {
      g = new THREE.Group();
      const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.38, 1.2, 6, 12), dragonMat);
      body.rotation.z = Math.PI / 2;
      body.position.y = 1.15;
      const hals = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.7, 8), dragonMat);
      hals.rotation.z = -Math.PI / 2;
      hals.position.set(0.85, 1.35, 0);
      const kopf = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.28, 0.3), dragonMat);
      kopf.position.set(1.25, 1.45, 0);
      const augeL = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), dragonGlowMat);
      augeL.position.set(1.4, 1.5, 0.09);
      const augeR = augeL.clone();
      augeR.position.z = -0.09;
      const fluegelL = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.06, 0.55), dragonMat);
      fluegelL.position.set(-0.2, 1.55, -0.8);
      fluegelL.rotation.x = -0.45;
      fluegelL.rotation.y = -0.5;
      const fluegelR = fluegelL.clone();
      fluegelR.position.z = 0.8;
      fluegelR.rotation.x = 0.45;
      fluegelR.rotation.y = 0.5;
      const schwanz = new THREE.Mesh(new THREE.ConeGeometry(0.16, 1.0, 8), dragonMat);
      schwanz.rotation.z = Math.PI / 2;
      schwanz.position.set(-1.0, 1.15, 0);
      const glutBrust = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 8), dragonGlowMat);
      glutBrust.position.set(0.25, 1.2, 0.38);
      g.add(body, hals, kopf, augeL, augeR, fluegelL, fluegelR, schwanz, glutBrust);
      break;
    }
    default: {
      g = skeletonBase();
      const schild = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.42, 0.06), darkSteelMat);
      schild.position.set(-0.26, 0.95, 0);
      const klinge = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.55, 0.12), ironMat);
      klinge.position.set(0.28, 1.0, 0);
      klinge.rotation.z = -0.2;
      g.add(schild, klinge);
    }
  }
  // Illustration als Sprite nachladen (bis dahin bleibt dieser 3D-Platzhalter sichtbar)
  applySprite(typeKey, g);
  return g;
}
