# Umgebungs-Illustrationen (L01 – Ender Dorfkirche)

Generierte SVG-Grafiken für die Arena-Umgebung. Das Spiel lädt sie automatisch
(`src/art.js`, gleiches Muster wie das Gegner-Sprite-System in `src/enemies.js`):
**eigene PNG zuerst → SVG → sonst bleibt der prozedurale 3D-Platzhalter**. Eine eigene
Illustration überschreibt also jederzeit die generierte Version.

## Dateinamen (exakt so benennen)

| Datei | Verwendung | Fallback |
|---|---|---|
| `himmel.png` / `himmel.svg` | Nachthimmel-Hintergrund (Blutmond) | einfarbiger Himmel + Nebel |
| `boden.png` / `boden.svg` | Kirchhof-Boden (Textur, 1024er-Kreis) | prozedurale Canvas-Textur (`src/ground.js`) |
| `kirche.png` / `kirche.svg` | Dorfkirche als Kulisse am Kartenrand | 3D-Blockkirche (`buildChurch`) |
| `grabstein.png` / `grabstein.svg` | Grabsteine im Aussenring | 3D-Grabsteine (`buildGravestones`) |
| `baum.png` / `baum.svg` | kahle Blutmond-Baeume im Aussenring | 3D-Astgabeln (`buildTrees`) |

## Hinweise

- SVGs haben transparenten Hintergrund (kein Keying nötig); bei PNGs greift das
  Eckfarben-Keying wie bei den Gegnern.
- `himmel.svg`: unterer Rand bleibt `#1a0c10` (Nebelfarbe), damit Arenarand und
  Hintergrund nahtlos verschmelzen.
- `boden.svg`: Draufsicht, Mitte = Denkmal-Position; der Pflasterplatz liegt um die
  Bildmitte (Weltradius 4.4 von 21).
- Nach dem Commit reicht ~1–2 Minuten Pages-Build, dann sind sie live.
