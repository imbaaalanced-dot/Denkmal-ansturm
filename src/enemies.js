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
const shadowBodyMat = new THREE.MeshStandardMaterial({ color: 0x151021, roughness: 0.95 });
const emberEyeMat = new THREE.MeshStandardMaterial({ color: 0x601414, emissive: 0xd7261a, emissiveIntensity: 1.4 });
const stoneGreyMat = new THREE.MeshStandardMaterial({ color: 0x6f675c, roughness: 0.95 });
const stoneDarkMat = new THREE.MeshStandardMaterial({ color: 0x4a443c, roughness: 0.95 });
const goldRuneMat = new THREE.MeshStandardMaterial({ color: 0xffca4a, emissive: 0xc2761d, emissiveIntensity: 0.9 });

// Werte = Platzhalter-Balancing (wird pro Level ausbalanciert, docs/ARCHITECTURE.md).
export const ENEMY_TYPES = {
  skelett: { name: 'Skelett-Soldat',    hpBase: 6,  hpPerWave: 0.6, speed: 1.5, dmg: 6,  bounty: 2,  scale: 1.0,
             sprites: ['assets/enemies/skelett.png'], spriteH: 1.9 },
  schattenwolf: { name: 'Schattenwolf', hpBase: 5,  hpPerWave: 0.5, speed: 3.2, dmg: 5,  bounty: 3,  scale: 0.9,
             sprites: ['assets/enemies/schattenwolf.png', 'assets/enemies/schattenwolf.svg'], spriteH: 1.6 },
  pirat:   { name: 'Skelett-Pirat',     hpBase: 4,  hpPerWave: 0.5, speed: 2.2, dmg: 5,  bounty: 2,  scale: 0.95,
             sprites: ['assets/enemies/pirat.png'], spriteH: 1.9 },
  gargoyle: { name: 'Gargoyle',         hpBase: 9,  hpPerWave: 0.8, speed: 1.9, dmg: 9,  bounty: 4,  scale: 1.2, float: true, slowResist: 0.5,
             sprites: ['assets/enemies/gargoyle.png', 'assets/enemies/gargoyle.svg'], spriteH: 2.0 },
  ritter:  { name: 'Ritter (Schwert)',  hpBase: 12, hpPerWave: 0.9, speed: 1.3, dmg: 9,  bounty: 3,  scale: 1.15,
             sprites: ['assets/enemies/ritter.png'], spriteH: 2.2 },
  geist:   { name: 'Nebel-Geist',       hpBase: 5,  hpPerWave: 0.5, speed: 2.6, dmg: 4,  bounty: 3,  scale: 1.0, float: true, slowResist: 0.5,
             sprites: ['assets/enemies/geist.png'], spriteH: 2.1 },
  krieger: { name: 'Axt-Krieger',       hpBase: 10, hpPerWave: 0.8, speed: 1.8, dmg: 12, bounty: 4,  scale: 1.1,
             sprites: ['assets/enemies/krieger.png'], spriteH: 2.2 },
  hammer:  { name: 'Ritter (Hammer)',   hpBase: 22, hpPerWave: 1.4, speed: 0.9, dmg: 18, bounty: 6,  scale: 1.35,
             sprites: ['assets/enemies/hammer.png'], spriteH: 2.5 },
  golem:   { name: 'Felsen-Golem',      hpBase: 40, hpPerWave: 2.5, speed: 0.7, dmg: 20, bounty: 10, scale: 1.55, slowResist: 0.5,
             sprites: ['assets/enemies/golem.png'], spriteH: 2.9 },
  knochenkoloss: { name: 'Knochenkoloss', hpBase: 55, hpPerWave: 3.2, speed: 0.55, dmg: 28, bounty: 15, scale: 1.8, slowResist: 0.5,
             sprites: ['assets/enemies/knochenkoloss.png', 'assets/enemies/knochenkoloss.svg'], spriteH: 3.4 },
  drache:  { name: 'Mech-Drache (Boss)', hpBase: 70, hpPerWave: 5.0, speed: 0.8, dmg: 40, bounty: 25, scale: 2.0, boss: true,
             sprites: ['assets/enemies/drache.png'], spriteH: 3.8 },
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
  // Bild mit transparenten Ecken (PNG/SVH)? Kein Keying noetig, sonst wuerde es
  // near-schwarzen Pixeln (z.B. den Schattenwolf) den Koerper wegnehmen.
  if (corners.some((c) => px[c + 3] < 10)) return canvas;
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
  const list = t && t.sprites && t.sprites.length > 0 ? t.sprites : (t && t.sprite ? [t.sprite] : []);
  if (list.length === 0) return;
  trySource(0);
  function trySource(i) {
    if (i >= list.length) return; // keine Quelle verfuegbar: 3D-Platzhalter bleibt
    const url = list[i];
    if (spriteCache.has(url)) {
      const cached = spriteCache.get(url);
      if (cached) attachSprite(cached, t, group);
      else trySource(i + 1);
      return;
    }
    spriteCache.set(url, null); // kennzeichnet 'laedt gerade'
    spriteLoader.load(
      url,
      (texture) => {
        try {
          const canvas = makeTransparent(texture.image);
          const canvasTexture = new THREE.CanvasTexture(canvas);
          canvasTexture.colorSpace = THREE.SRGBColorSpace;
          spriteCache.set(url, canvasTexture);
          attachSprite(canvasTexture, t, group);
        } catch (err) {
          spriteCache.set(url, null);
          // Verarbeitung fehlgeschlagen: Platzhalter bleibt
        }
      },
      undefined,
      () => { spriteCache.set(url, null); trySource(i + 1); }
    );
  }
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
    case 'schattenwolf': {
      g = new THREE.Group();
      const leib = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.62, 6, 10), shadowBodyMat);
      leib.rotation.z = Math.PI / 2;
      leib.position.y = 0.55;
      const kopfW = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.34, 8), shadowBodyMat);
      kopfW.rotation.z = -Math.PI / 2;
      kopfW.position.set(0.52, 0.66, 0);
      const rachen = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.06, 0.1), emberEyeMat);
      rachen.position.set(0.68, 0.62, 0);
      const ohrL = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.16, 6), shadowBodyMat);
      ohrL.position.set(0.44, 0.84, 0.08);
      const ohrR = ohrL.clone();
      ohrR.position.z = -0.08;
      const augenL = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), emberEyeMat);
      augenL.position.set(0.6, 0.7, 0.07);
      const augenR = augenL.clone();
      augenR.position.z = -0.07;
      const runeW = new THREE.Mesh(new THREE.OctahedronGeometry(0.06), goldRuneMat);
      runeW.position.set(0.05, 0.72, 0);
      const schwanz = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.5, 6), shadowBodyMat);
      schwanz.rotation.z = 1.9;
      schwanz.position.set(-0.52, 0.62, 0);
      const beine = [];
      for (let i = 0; i < 4; i++) {
        const bein = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.42, 6), shadowBodyMat);
        bein.position.set(i % 2 === 0 ? 0.28 : -0.28, 0.24, i < 2 ? 0.16 : -0.16);
        beine.push(bein);
      }
      g.add(leib, kopfW, rachen, ohrL, ohrR, augenL, augenR, runeW, schwanz);
      g.add(...beine);
      break;
    }
    case 'gargoyle': {
      g = new THREE.Group();
      const torsoG = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.6, 0.3), stoneGreyMat);
      torsoG.position.y = 0.9;
      const rissG = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.34, 0.05), goldRuneMat);
      rissG.position.set(0, 0.92, 0.16);
      const kopfG = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.24, 0.28), stoneGreyMat);
      kopfG.position.y = 1.34;
      const kieferG = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.08, 0.2), stoneDarkMat);
      kieferG.position.set(0.03, 1.2, 0);
      const hornL = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.24, 6), stoneDarkMat);
      hornL.position.set(-0.1, 1.54, 0.06);
      const hornR = hornL.clone();
      hornR.position.z = -0.06;
      const augeGL = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), emberEyeMat);
      augeGL.position.set(0.06, 1.38, 0.09);
      const augeGR = augeGL.clone();
      augeGR.position.z = -0.09;
      const flgL = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.05, 0.5), stoneDarkMat);
      flgL.position.set(0, 1.15, -0.5);
      flgL.rotation.y = 0.5;
      const flgR = flgL.clone();
      flgR.position.z = 0.5;
      flgR.rotation.y = -0.5;
      const armL = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.5, 6), stoneGreyMat);
      armL.position.set(-0.28, 0.85, 0);
      const armR = armL.clone();
      armR.position.x = 0.28;
      g.add(torsoG, rissG, kopfG, kieferG, hornL, hornR, augeGL, augeGR, flgL, flgR, armL, armR);
      break;
    }
    case 'knochenkoloss': {
      g = new THREE.Group();
      const beinL = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 0.85, 8), boneMat);
      beinL.position.set(-0.24, 0.42, 0);
      const beinR = beinL.clone();
      beinR.position.x = 0.24;
      const torusB = new THREE.Mesh(new THREE.SphereGeometry(0.52, 10, 8), boneMat);
      torusB.scale.set(1, 0.9, 0.78);
      torusB.position.y = 1.55;
      const schaedelK = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.42, 0.42), boneMat);
      schaedelK.position.y = 2.3;
      const augeKL = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), goldRuneMat);
      augeKL.position.set(-0.11, 2.32, 0.2);
      const augeKR = augeKL.clone();
      augeKR.position.x = 0.11;
      const armL2 = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 1.1, 6), boneMat);
      armL2.position.set(-0.66, 1.5, 0);
      armL2.rotation.z = 0.18;
      const armR2 = armL2.clone();
      armR2.position.x = 0.66;
      armR2.rotation.z = -0.18;
      const steinL = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.46, 0.2), darkStoneMat);
      steinL.position.set(-0.72, 0.82, 0.1);
      const steinR = steinL.clone();
      steinR.position.x = 0.72;
      const fugL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.5, 0.04), goldRuneMat);
      fugL.position.set(-0.72, 1.0, 0.22);
      const fugR = fugL.clone();
      fugR.position.x = 0.72;
      g.add(beinL, beinR, torusB, schaedelK, augeKL, augeKR, armL2, armR2, steinL, steinR, fugL, fugR);
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
