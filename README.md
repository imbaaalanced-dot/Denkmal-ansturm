# Denkmal Ansturm

**360°-Tower-Defense um echte Denkmäler** – Dark-Fantasy-Stil, Hybrid-3D im Browser (Android/WebView + Desktop). Eigenständige Neuentwicklung neben [Denkmal TD2](https://github.com/imbaaalanced-dot/a): gleicher Stil, neues Spiel, neue technische Basis.

**Live-Prototyp (GitHub Pages):** https://imbaaalanced-dot.github.io/Denkmal-ansturm/

## Kern-Features

- **Echte Denkmäler als Levelzentrum** – fotorealistisch per Fotogrammetrie aus realen Referenzfotos
- **360°-Ansturm** – Monster spawnen rund ums Denkmal, verteidigt wird ringförmig (feste Slot-Ringe)
- **100 Wellen pro Level**, Geschwindigkeit **x1 / x2 / x3 / x5**
- **Bosse jede 10. Welle** – verdorbene Denkmal-Verstärkungen
- **Roguelite-Perks nach je 5 Wellen** (1 aus 3 Karten, mit Specials)
- **Meta-Progression**: Upgrade-Tree im Hauptmenü, Währung **Tech-Atome** (nur durchs Spielen verdient)
- **New Game+** nach Welle 100
- Monetarisierung: Werbung (Banner + Rewarded), kein Pay-to-Win

## Startlevel (je 100 Wellen)

| Nr. | Denkmal | Zentrum / Verteidigungsziel | Ort |
| --- | --- | --- | --- |
| 01 | Ender Dorfkirche + Kriegerdenkmal | **Der Löwe** (Kirche als Randkulisse) | Herdecke-Kirchende |
| 02 | Kriegerdenkmal Kirchende | zu klären (evtl. identisch mit L01) | Herdecke |
| 03 | Hohensyburg | Kaiser-Wilhelm-Denkmal (Ruine als Kulisse) | Hagen / Wetter (Ruhr) |

## Quickstart (Prototyp)

Der Prototyp nutzt ES-Module und lädt three.js per CDN. Offline geht er über einen lokalen Webserver:

```bash
npx serve .        # oder: python3 -m http.server 8000
```

Dann öffnen: `http://localhost:8000` (Desktop-Browser oder Android-WebView).

**Bedienung:** Start drücken, Gegner laufen von allen Seiten auf den Löwen zu. **Slot antipfen = Platzhalter-Turm bauen (10 Energie).** Unten: Speed x1–x5, Start/Pause/Neustart. Der Balken zeigt die Löwen-Integrität.

## Projektstruktur

```text
denkmal-ansturm/
├── index.html            # Einstieg + HUD-Overlay
├── src/
│   ├── main.js           # Bootstrap: Input, HUD, Render-Loop
│   ├── engine.js         # Renderer, orthografische Iso-Kamera, Licht
│   ├── game.js           # L01-Welt (Löwe, Dorfkirche, Slot-Ringe) + Spiellogik
│   ├── wavedata.js       # datengetriebene Wellen-Definition (Platzhalter)
│   └── ui.js             # HUD-Bindung (DOM)
├── docs/
│   ├── DESIGN-BRIEF.md   # alle Produktentscheidungen
│   ├── ARCHITECTURE.md   # Technik + Performance-Budget
│   ├── ASSET-PIPELINE.md # Fotogrammetrie-Workflow
│   └── LEVELS.md         # Startlevel + Referenz-Recherche
└── assets/
    ├── enemies/          # Gegner-Sprites (PNG → SVG → 3D-Fallback)
    ├── environment/      # Umgebungs-Art L01 (Himmel, Boden, Kirche, Grabsteine, Bäume)
    ├── level/            # Level-Art (Steinlöwe/Denkmal, Level-Emblem)
    └── models/           # Fotogrammetrie-GLBs, pro Level ein Ordner
```

## Nächste Schritte

- [ ] Foto-Set Löwe (L01) für Fotogrammetrie: 80–120 Fotos reihum (siehe docs/ASSET-PIPELINE.md)
- [ ] Fotogrammetrie-Pipeline am echten Denkmal testen (Meshroom → Blender → GLB)
- [ ] Slot-Layouts pro Level statt Standard-Ringen
- [ ] Perk-Kartenset (1 aus 3, alle 5 Wellen)
- [ ] Tech-Atome: Upgrade-Tree + Persistenz (localStorage, versioniert)
- [ ] Vite-Bundle für Offline-WebView statt CDN-Import
- [ ] dark-orchestrale KI-Musik + Sounds (WebView-Autoplay beachten)
- [ ] Rewarded-Video-Einbindung (nur Boni, nie Balancing)

**Hinweis:** Umgebungs- und Level-Grafiken liegen als generierte SVGs in `assets/environment/` und `assets/level/` (Lade-Kette PNG → SVG → prozeduraler 3D-Platzhalter, siehe `src/art.js`). Balancing ist Platzhalter, bis die echten GLB-Assets stehen.
