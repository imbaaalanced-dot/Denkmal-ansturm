# Gegner-Roster L01 (Referenzen: Marcels 8 Illustrationen, Nov 2026)

Werte sind Platzhalter-Balancing und werden pro Level ausbalanciert. Bilder liegen als Referenz bei Marcel, werden nicht committen.

| Typ | Referenz | Rolle | Freischaltung | HP-Basis (pro Welle) | Tempo | Schaden | Kopfgeld |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Skelett-Soldat | Skelett mit Schild (Lilie) und Schwert | Standard | Welle 1 | 6 (+0.6) | 1.5 | 6 | 2 |
| Skelett-Pirat | Skelett mit Hut und Feder | Sprinter | Welle 12 | 4 (+0.5) | 2.2 | 5 | 2 |
| Ritter (Schwert) | Ritter in dunkler Ruestung | Solider Lauefer | Welle 20 | 12 (+0.9) | 1.3 | 9 | 3 |
| Nebel-Geist | Blaues Nebel-Wesen | Sprinter, schwebt, kein Schattenwurf | Welle 25 | 3 (+0.4) | 2.6 | 4 | 3 |
| Axt-Krieger | Baertiger Krieger mit Streitaxt | Berserker | Welle 30 | 10 (+0.8) | 1.8 | 12 | 4 |
| Ritter (Hammer) | Ritter mit Streithammer | Brecher | Welle 40 | 22 (+1.4) | 0.9 | 18 | 6 |
| Felsen-Golem |_ueberwucherter Steinriese mit violetter Glut | Panzer | Welle 50 | 40 (+2.5) | 0.7 | 20 | 10 |
| Mech-Drache | Mechanischer Drache | **Boss jede 10. Welle, waechst je Bosswelle (+12 % Groesse, +35 % HP, +25 % Schaden pro Bossstufe)** | Welle 10 | 70 (+5.0) | 0.8 | 40 | 25 |

Zusaetzlich: ab Boss-Welle 40 erscheinen zwei Drachen.

## Naechste Ausbaustufen des Rosters
- [ ] Bogenschuetze (Fernangriff auf Tuerme) aus dem Ritter-Design
- [ ] Geist-Spezial: langsamturm-spezial?
- [ ] Drachen-Flugphase (schwebt hoeher, nur von bestimmten Tuermen treffbar)
- [ ] Fertige 3D-Modelle statt Platzhalter (pipeline analog zu ASSET-PIPELINE.md)


## Sprite-Einbindung (Marcels Illustrationen)

Seit dem Sprite-Commit nutzt `buildEnemyMesh` automatisch die Original-Illustrationen aus
`assets/enemies/<typ>.png` (Dateinamen-Tabelle in `assets/enemies/README.md`):

- Laden Asynchron via TextureLoader; bis zum Ende der Verarbeitung bleibt der 3D-Platzhalter sichtbar.
- Einfarbige Hintergründe werden per Eckfarben-Keying (Toleranz 70) zur Laufzeit transparent geschaltet; transparente PNGs funktionieren direkt.
- Fehlt eine Datei (404), bleibt der Platzhalter dauerhaft aktiv, das Spiel bricht niemals ab.
- Bosse behalten ihr Wellen-Wachstum (Gruppe skaliert, Sprite skaliert mit).
- Sprites werfen keine Schatten (Billboards) - ein Boden-Schattenblob ist ein späterer Polierauftrag.
