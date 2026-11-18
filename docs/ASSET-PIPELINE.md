# Asset-Pipeline: Fotogrammetrie-Denkmäler

**Ziel:** Reale Denkmäler als fotorealistische, mobil-taugliche 3D-Modelle (GLB) für die Hybrid-Engine.

## Schritt 1 – Referenzfotos (Marcel fotografiert oder Recherche)

Pro Denkmal **80–150 Fotos**:

- Ringförmig um das Denkmal, **60–80 % Überlappung** zwischen aufeinanderfolgenden Bildern
- 2–3 Kamerahöhen (tief, Augenhöhe, erhöht, z. B. Selfie-Stick); letzte Runde: Details (Inschriften, Reliefs, Schäden)
- Möglichst diffuses Licht (bedeckt oder goldene Stunde), keine harten Direktschatten, möglichst niemand im Bild
- Gleiche Kameraeinstellungen pro Set (feste Belichtung), RAW oder höchste JPG-Qualität
- Extra: ein Übersichtsfoto aus erhöhter Position als Vorlage fürs Slot-Layout

## Schritt 2 – Rekonstruktion

- Standardwerkzeug: **Meshroom** (kostenlos): Fotos → Alignment → Dense Reconstruction → Textur (Arbeitsversion 4096)
- Alternativen: RealityCapture (besser, kostenpflichtig), 3DF Zephyr (Free-Version)
- Qualitätskriterium: geschlossenes Mesh, keine Floater, Inschriften lesbar

## Schritt 3 – Aufbereitung (Blender)

- Hintergrund- und Boden-Mesh entfernen, Löcher schließen
- **Dezimieren auf max. 40.000 Triangles** (Ziel 25–30k), Ergebnis prüfen
- UVs neu packen, Textur backen auf max. **2048 x 2048** (später KTX2/Basis)
- Maßstab normalisieren: Denkmal 6–10 Einheiten hoch, Ursprung am Boden, Y-Achse nach oben
- Dark-Fantasy-Lighting testen: Modell muss auch bei dunkler Umgebung + Mondlicht gut lesbar bleiben

## Schritt 4 – Einbau

- Export nach assets/models/level-slug-Ordner (z. B. 01-ender-dorfkirche)
- THREE.GLTFLoader ersetzt das prozedurale Dummy-Denkmal in game.js (buildWorld)
- Slot-Ringe pro Level als Datendatei (Positionen relativ zum Denkmal-Ursprung)
- Referenz-RAWs nicht committen: assets/raw/ steht in .gitignore

## Budget-Tabelle (4-GB-Android)

| Ressource | Budget |
| --- | --- |
| Denkmal-GLB Triangles | max. 40.000 (Ziel 25.000) |
| Texturen | max. 2048 x 2048, komprimiert (später KTX2) |
| GLB-Dateigröße | max. 8 MB |
| Draw calls gesamt | unter 100 pro Frame |
| Gegner gleichzeitig | max. 80 (Instancing + Pooling) |

## Checkliste pro Denkmal

- [ ] Foto-Set vollständig (Ringe + Detail-Pass)
- [ ] Rekonstruktion: Mesh geschlossen, keine Floater
- [ ] Dezimierung + Texturbacken innerhalb des Budgets
- [ ] GLB geladen, Schatten sauber, Dark-Fantasy-Grading geprüft
- [ ] Slots platziert, Spawnpunkte rundum getestet
- [ ] FPS-Test auf dem 4-GB-Gerät bestanden
