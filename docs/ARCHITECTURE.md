# Architektur – Denkmal Ansturm

Neuentwicklung, bewusst getrennt von Denkmal TD2 (eigenes Repo), aber mit den dort gelernten Lektionen (WebView-Panik, Save/Reload, Grafikflackern, Performance-Budgets).

## Zielplattformen

1. Android/WebView, Hochformat, 4-GB-Testgerät (erste Priorität)
2. Desktop-Browser (Querformat)

## Performance-Budget (Grenzwerte; Überschreitung = Issue anlegen)

- FPS: Minimum 30 auf dem 4-GB-Gerät, 60 auf Desktop
- Denkmal-Modell: max. 40k Triangles (Ziel 25k), Texturen max. 2048x2048 (später KTX2-Basis-Kompression)
- Draw calls: Ziel unter 100 pro Frame
- Gegner gleichzeitig: max. 80 geplant; dauerhaft Instancing + Objekt-Pooling (der Prototyp baut noch pro Gegner Mesh/Material, bewusst in Kauf genommen)
- Speicher: keine Textur größer 4 MB unkomprimiert

## Rendering-Konzept (Hybrid)

- Echtes 3D via Three.js/WebGL: Denkmal-GLB (Fotogrammetrie), Terrain, Slots, Licht mit Schatten
- 2D-Effekte als HTML/Canvas-Overlay und Billboard-Sprites: Perk-Karten, Boss-Ankündigungen, Explosionen
- Kamera: orthografisch, isometrie-nah; passt sich automatisch ans Hochformat an (die kleinere Bildschirmachse zeigt immer die komplette Arena, siehe engine.js → resize)

## Codestruktur

- engine.js – Renderer, Kamera, Licht (kein Gameplay)
- game.js – Welt (Dummy-Denkmal, Slot-Ringe) + Game-Klasse (Wellen, Gegner, Türme, Projektile)
- wavedata.js – datengetriebene Wellen-Definition (Platzhalter-Balancing, später pro Level JSON)
- ui.js – HUD-Bindung (DOM)
- main.js – Bootstrap, Input, Render-Loop
- Regel: Spiellogik kennt kein DOM, UI berechnet keine Logik

## Fixe Spielregeln

- 100 Wellen pro Level, Speed x1/x2/x3/x5
- Boss jede 10. Welle (verdorbene Denkmal-Verstärkung)
- Perk-Wahl 1-aus-3 nach je 5 Wellen (Roguelite, im Spiel, mit Specials)
- Tech-Atome + Upgrade-Tree: Hauptmenü-Metasystem, nur durch Gameplay verdient; Persistenz via localStorage mit Versionsfeld und Migrations-Handler, robust gegen WebView-Kill
- Welle 100: Level abgeschlossen + New Game+-Challenge

## WebView-Checkliste

- Audio-Unlock erst nach erster Nutzereingabe (Autoplay-Policy)
- visibilitychange: automatische Pause (im Prototyp implementiert)
- devicePixelRatio begrenzen (max. 2, implementiert)
- localStorage versioniert + Migration-Handler von Anfang an
- CDN-Import (importmap) nur für den Prototyp; früh auf Vite-Bundle umstellen (Offline, Ladezeit, Caching)

## Offene technische Entscheidungen

- Bundler: Vite
- Instancing-Strategie für Gegnermassen
- Ads: Rewarded-Video-SDK für WebView (z. B. AdMob über Bridge); Fairness: nur Boni, nie Balancing
- Audio: KI-generiert, dark-orchestral; Formate und Preload-Strategie


## Persistenz (Save/Reload) – implementiert

- **Checkpoint-Modell:** Gespeichert wird nach jeder geschafften Welle, jeder Perk-Wahl, jedem Denkmal-Upgrade und jedem Turmbau (`Game.serialize()`).
- **Kein Mid-Wave-Save:** Der Restore startet immer am Anfang der nächsten Welle – halbfertige Wellenzustände (Gegnerpositionen, Projektile) werden nicht serialisiert. Das macht App-Kill/WebView-Kill robust.
- **localStorage**, Schlüssel `denkmal-ansturm-save`, Versionsfeld `v` für spätere Migrationen (`src/save.js`).
- **Wiederherstellung:** `Game.restore(data)` baut die 4 Türme auf ihren N/O/S/W-Plätzen wieder auf (`padKey` je Turm) und stellt LP, Energie, Perks und Denkmal-Stufen her; Zustand danach `paused`.
- **Verworfen** wird der Speicher bei Niederlage, Sieg (Welle 100) und Neustart (`reset(true)`).
- Blockiertes localStorage (z. B. Privater Modus) bricht nichts: Das Spiel läuft dann ohne Persistenz weiter.
