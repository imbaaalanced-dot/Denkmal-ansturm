# Gegner-Illustrationen (Sprites)

Hier liegen Marcels Monster-Illustrationen als PNG. Das Spiel lädt sie automatisch
(`src/enemies.js`, Sprite-System) und schaltet einfarbige Hintergründe per
Eckfarben-Keying automatisch transparent. Fehlt eine Datei, bleibt der 3D-Platzhalter aktiv.

## Dateinamen (exakt so benennen)

| Datei | Gegner | Freischaltung |
|---|---|---|
| `skelett.png` | Skelett-Soldat | Welle 1 |
| `pirat.png` | Skelett-Pirat | Welle 12 |
| `geist.png` | Nebel-Geist | Welle 25 |
| `ritter.png` | Ritter (Schwert) | Welle 20 |
| `krieger.png` | Axt-Krieger | Welle 30 |
| `hammer.png` | Ritter (Hammer) | Welle 40 |
| `golem.png` | Felsen-Golem | Welle 50 |
| `drache.png` | Mech-Drache (Boss) | alle 10 Wellen |
| `schattenwolf.png` | Schattenwolf | Welle 10 |
| `gargoyle.png` | Gargoyle (fliegt) | Welle 18 |
| `knochenkoloss.png` | Knochenkoloss (Elite) | Welle 65 |

Die drei neuen Gegner sind bereits als generierte SVG-Versionen (`schattenwolf.svg`, `gargoyle.svg`, `knochenkoloss.svg`) eingebaut. Lädt das Spiel in dieser Reihenfolge: eigene PNG zuerst → SVG → sonst 3D-Platzhalter. Deine eigene Illustration übersteuert also jederzeit.

Hinweise:
- Hochkant/quadratisch funktioniert am besten (Figur füllt das Bild).
- Der Mechan-Drache skaliert automatisch mit (Boss-Wachstum bleibt erhalten).
- Nach dem Commit reicht ~1–2 Minuten Pages-Build, dann sind sie live.
