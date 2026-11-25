# Level-Illustrationen (L01 – Ender Dorfkirche)

Generierte SVG-Grafiken für das Level selbst (Verteidigungsziel + Emblem).
Lade-Reihenfolge wie überall im Spiel (`src/art.js`): **eigene PNG zuerst → SVG →
prozeduraler 3D-Platzhalter**. Eine eigene Illustration überschreibt also jederzeit.

## Dateinamen (exakt so benennen)

| Datei | Verwendung | Fallback |
|---|---|---|
| `loewe.png` / `loewe.svg` | Steinlöwe auf dem Kriegerdenkmal (Sprite über dem 3D-Sockel, Zentrum der Arena) | 3D-Platzhalter-Löwe (`buildLion` in `src/game.js`) |
| `level-01.png` / `level-01.svg` | Level-Emblem (Favicon + Denkmal-Panel im HUD) | ohne Bild (nur Text/Emoji) |

## Hinweise

- `loewe.svg`: querformatig (Liegeloewe, ca. 2:1), Figur füllt die Breite; das untere
  Ende des Bildes steht auf dem Sockel (Sprite-Anker unten Mitte).
- `level-01.svg`: quadratisch, als Favicon und als rundes Emblem im Denkmal-Panel
  (`index.html`) eingebunden.
- Echte Denkmäler landen später als fotogrammetrische GLBs in `assets/models/`
  (siehe `docs/ASSET-PIPELINE.md`) und ersetzen das Sprite-System.
- Nach dem Commit reicht ~1–2 Minuten Pages-Build, dann sind sie live.
