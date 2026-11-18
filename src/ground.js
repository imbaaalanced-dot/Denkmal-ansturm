import * as THREE from 'three';

// Prozedurale Boden-Extras fuer L01 (Ender Dorfkirche):
// - Canvas-Textur: dunkler Kirchhof-Rasen, Kopfsteinpflaster-Platz ums Denkmal,
//   Herbstlaub, Fugen- und Kiesrauschen, Vignette am Arenarand.
// - Grabsteine als kleine Kulisse im Aussenring (ausserhalb der Spawnradien).
// Keine externen Assets => laedt sofort, WebView-freundlich (1024er Textur).

export function createGroundTexture(size = 1024, worldRadius = 21) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const C = size / 2;

  // 1) Basis: knochengrauer Blutmond-Boden
  ctx.fillStyle = '#262326';
  ctx.fillRect(0, 0, size, size);

  // 2) grosse Farbflecken fuer Rasen-Variation
  const blotch = ['#231f22', '#2b2626', '#25222a', '#2a2521', '#201d1f'];
  for (let i = 0; i < 380; i++) {
    ctx.fillStyle = blotch[(Math.random() * blotch.length) | 0];
    ctx.globalAlpha = 0.25 + Math.random() * 0.3;
    const bx = Math.random() * size;
    const by = Math.random() * size;
    const br = 10 + Math.random() * 55;
    ctx.beginPath();
    ctx.ellipse(bx, by, br, br * (0.5 + Math.random()), Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  // 3) feines Kies-Rauschen
  ctx.globalAlpha = 1;
  for (let i = 0; i < 9000; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? '#392f2e18' : '#15101228';
    ctx.fillRect(Math.random() * size, Math.random() * size, 1 + Math.random() * 2, 1 + Math.random() * 2);
  }

  // 4) Grasbuendel (kurze Striche in zwei Toenen)
  for (let i = 0; i < 2600; i++) {
    const gx = Math.random() * size;
    const gy = Math.random() * size;
    ctx.strokeStyle = Math.random() > 0.5 ? '#4a4132' : '#201b17';
    ctx.globalAlpha = 0.45 + Math.random() * 0.4;
    ctx.lineWidth = 1 + Math.random();
    ctx.beginPath();
    ctx.moveTo(gx, gy);
    ctx.lineTo(gx + (Math.random() - 0.5) * 6, gy - (3 + Math.random() * 4));
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // 5) Kopfsteinpflaster-Platz um das Denkmal (Weltradius ca. 4.4)
  const plaza = (4.4 / worldRadius) * C;
  const stonePx = plaza * 0.055;

  // Kies-Unterboden
  ctx.fillStyle = '#332e33';
  ctx.beginPath();
  ctx.arc(C, C, plaza * 1.06, 0, Math.PI * 2);
  ctx.fill();

  let ring = stonePx * 1.1;
  let row = 0;
  while (ring < plaza * 0.99) {
    const stones = Math.max(6, Math.round((ring / plaza) * 24));
    for (let i = 0; i < stones; i++) {
      const a = (i / stones) * Math.PI * 2 + row * 0.35 + Math.random() * 0.12;
      const rr = ring * (0.9 + Math.random() * 0.18);
      const sx = C + Math.cos(a) * rr;
      const sy = C + Math.sin(a) * rr;
      const grey = 62 + ((Math.random() * 34) | 0);
      ctx.fillStyle = 'rgb(' + (grey + 8) + ',' + grey + ',' + (grey - 10) + ')';
      ctx.beginPath();
      ctx.ellipse(sx, sy, stonePx * (0.8 + Math.random() * 0.4), stonePx * (0.62 + Math.random() * 0.33), a, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#161314';
      ctx.globalAlpha = 0.7;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    ring += stonePx * 1.6;
    row++;
  }
  // Mittelstein unter dem Denkmal
  ctx.fillStyle = '#56504a';
  ctx.beginPath();
  ctx.arc(C, C, stonePx * 1.6, 0, Math.PI * 2);
  ctx.fill();

  // 6) Duerre Moos-Flecken am Plazarand (Blutmond)
  for (let i = 0; i < 260; i++) {
    const a = Math.random() * Math.PI * 2;
    const rr = plaza * (0.5 + Math.random() * 0.5);
    ctx.fillStyle = '#54402e';
    ctx.globalAlpha = 0.25 + Math.random() * 0.3;
    ctx.beginPath();
    ctx.arc(C + Math.cos(a) * rr, C + Math.sin(a) * rr, 1.5 + Math.random() * 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // 7) Blutmond-Laub: dunkles Rot und Rost
  const leaves = ['#8a3a28', '#96402c', '#5e2f22', '#a83828', '#6b4430'];
  for (let i = 0; i < 750; i++) {
    ctx.fillStyle = leaves[(Math.random() * leaves.length) | 0];
    ctx.globalAlpha = 0.45 + Math.random() * 0.5;
    const lx = Math.random() * size;
    const ly = Math.random() * size;
    ctx.save();
    ctx.translate(lx, ly);
    ctx.rotate(Math.random() * Math.PI);
    ctx.beginPath();
    ctx.ellipse(0, 0, 2 + Math.random() * 2.4, 1.2 + Math.random() * 1.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.globalAlpha = 1;

  // 8) Vignette Richtung Arenarand (Dark-Fantasy-Tiefe)
  const grad = ctx.createRadialGradient(C, C, C * 0.55, C, C, C);
  grad.addColorStop(0, 'rgba(18,6,8,0)');
  grad.addColorStop(1, 'rgba(18,6,8,0.62)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(C, C, C, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

// Grabsteine als kleine Kulisse im Aussenring (Radius 16.2-19.5),
// ausserhalb der Gegner-Spawnradien (15-15.7) und ohne den Kirchenkeil.
export function buildGravestones(scene, churchAngle, churchWedge) {
  const stones = [];
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x7d766b, roughness: 0.9 });
  const mossMat = new THREE.MeshStandardMaterial({ color: 0x50402e, roughness: 1.0 });

  const count = 16;
  let placed = 0;
  let guard = 0;
  while (placed < count && guard < 200) {
    guard++;
    const a = Math.random() * Math.PI * 2;
    const diff = Math.atan2(Math.sin(a - churchAngle), Math.cos(a - churchAngle));
    if (Math.abs(diff) < churchWedge + 0.3) continue;
    placed++;

    const g = new THREE.Group();
    const w = 0.55 + Math.random() * 0.3;
    const h = 0.8 + Math.random() * 0.6;
    const slab = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.14), stoneMat);
    slab.position.y = h / 2;
    const top = new THREE.Mesh(
      new THREE.CylinderGeometry(w / 2, w / 2, 0.14, 10, 1, false, 0, Math.PI),
      stoneMat
    );
    top.rotation.x = Math.PI / 2;
    top.rotation.z = Math.PI / 2;
    top.position.y = h;
    g.add(slab, top);
    if (Math.random() > 0.55) {
      const moss = new THREE.Mesh(new THREE.BoxGeometry(w * 0.5, h * 0.3, 0.03), mossMat);
      moss.position.set((Math.random() - 0.5) * w * 0.3, h * (0.2 + Math.random() * 0.4), 0.085);
      g.add(moss);
    }
    const rr = 16.3 + Math.random() * 3.0;
    const tilt = (Math.random() - 0.5) * 0.16;
    g.position.set(Math.cos(a) * rr, 0, Math.sin(a) * rr);
    g.rotation.y = Math.random() * Math.PI;
    g.rotation.z = tilt;
    g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    scene.add(g);
    stones.push(g);
  }
  return stones;
}
