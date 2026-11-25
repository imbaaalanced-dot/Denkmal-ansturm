import * as THREE from 'three';

// Art-System fuer Umgebung & Level (gleiches Muster wie das Gegner-Sprite-System
// in enemies.js): eigene PNG zuerst -> generiertes SVG -> sonst bleibt der
// prozedurale 3D-Platzhalter stehen (niemals ein Bruch).
// Siehe assets/environment/README.md und assets/level/README.md.

const textureCache = new Map();
const texLoader = new THREE.TextureLoader();

// Eckfarben-Keying fuer PNG-Illustrationen (wie in enemies.js). SVG mit
// transparenten Ecken wird nicht angefasst.
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
  const corners = [0, (w - 1) * 4, (h - 1) * w * 4, ((h - 1) * w + (w - 1)) * 4];
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

// Laedt die erste verfuegbare Quelle der Kette (PNG -> SVG). onReady bekommt
// die Textur oder null (Fallback). key=true: Eckfarben-Keying fuer Sprites.
export function loadArtTexture(urls, onReady, { key = false } = {}) {
  const list = (urls || []).filter(Boolean);
  if (list.length === 0) { onReady(null); return; }
  trySource(0);
  function trySource(i) {
    if (i >= list.length) { onReady(null); return; }
    const url = list[i];
    if (textureCache.has(url)) {
      const cached = textureCache.get(url);
      if (cached) onReady(cached);
      else trySource(i + 1);
      return;
    }
    textureCache.set(url, null); // kennzeichnet 'laedt gerade'
    texLoader.load(
      url,
      (tex) => {
        try {
          let out = tex;
          if (key) {
            const canvas = makeTransparent(tex.image);
            out = new THREE.CanvasTexture(canvas);
          }
          out.colorSpace = THREE.SRGBColorSpace;
          textureCache.set(url, out);
          onReady(out);
        } catch (err) {
          textureCache.set(url, null);
          trySource(i + 1);
        }
      },
      undefined,
      () => { textureCache.set(url, null); trySource(i + 1); }
    );
  }
}

function attachOne(group, tex, height, opts) {
  while (group.children.length > 0) group.remove(group.children[0]);
  const img = tex.image;
  const aspect = img.width > 0 && img.height > 0 ? img.width / img.height : 1;
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: tex, transparent: true, alphaTest: 0.06 })
  );
  sprite.center.set(0.5, 0); // Illustration steht auf dem Boden
  sprite.scale.set(height * aspect, height, 1);
  group.add(sprite);
  if (opts.baseY !== undefined) group.position.y = opts.baseY;
}

// Ersetzt den Inhalt der Gruppe durch ein Billboard-Sprite, sobald die Art geladen
// ist; vorher (und bei Fehler) bleibt der 3D-Platzhalter sichtbar.
export function attachArtSprite(group, urls, height, opts = {}) {
  loadArtTexture(urls, (tex) => { if (tex) attachOne(group, tex, height, opts); }, { key: true });
}

// Wie attachArtSprite, aber fuer mehrere Gruppen (z. B. alle Grabsteine/Baeume).
export function attachArtSprites(groups, urls, height, opts = {}) {
  loadArtTexture(urls, (tex) => { if (tex) for (const g of groups) attachOne(g, tex, height, opts); }, { key: true });
}

// Boden-Textur: Fallback sofort setzen, bei geladenem Art-Bild austauschen.
export function applyGroundTexture(material, urls, fallbackFactory) {
  material.map = fallbackFactory();
  material.needsUpdate = true;
  loadArtTexture(urls, (tex) => {
    if (!tex) return;
    material.map = tex;
    material.needsUpdate = true;
  });
}

// Nachthimmel als Szenen-Hintergrund: Fallback-Farbe sofort, Art-Himmel bei Laden.
export function applySkyBackground(scene, urls, fallbackColor) {
  scene.background = new THREE.Color(fallbackColor);
  loadArtTexture(urls, (tex) => { if (tex) scene.background = tex; });
}
