# Denkmal Ansturm

**360°-Tower-Defense um echte Denkmäler** – Dark-Fantasy-Stil, Hybrid-3D im Browser (Android/WebView + Desktop). Eigenständige Neuentwicklung neben [Denkmal TD2](https://github.com/imbaaalanced-dot/a): gleicher Stil, neues Spiel, neue technische Basis.

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

| Nr. | Denkmal | Ort |
| --- | --- | --- |
| 01 | Ender Dorfkirche | Herdecke-Kirchende |
| 02 | Kriegerdenkmal Kirchende | Herdecke |
| 03 | Hohensyburg | Hagen / Wetter (Ruhr) |

## Quickstart (Prototyp)

Der Prototyp nutzt ES-Module und lädt three.js per CDN, deshalb braucht es lokal einen simplen Webserver:

```bash
npx serve .        # oder: python3 -m http.server 8000
```

Dann öffnen: `http://localhost:8000` (Desktop-Browser oder Android-WebView).

**Bedienung:** Start drücken, Gegner laufen von allen Seiten aufs Denkmal zu. **Slot antipfen = Platzhalter-Turm bauen (10 Energie).** Unten: Speed x1–x5, Start/Pause/Neustart. Der Balken unten zeigt die Denkmal-Integrität.

## Projektstruktur

```text
denkmal-ansturm/
├── index.html            # Einstieg + HUD-Overlay
├── src/
│   ├── main.js           # Bootstrap: Input, HUD, Render-Loop
│   ├── engine.js         # Renderer, orthografische Iso-Kamera, Licht
│   ├── game.js           # Welt (Dummy-Denkmal, Slot-Ringe) + Spiellogik
│   ├── wavedata.js       # datengetriebene Wellen-Definition (Platzhalter)
│   └── ui.js             # HUD-Bindung (DOM)
├── docs/
│   ├── DESIGN-BRIEF.md   # alle Produktentscheidungen
│   ├── ARCHITECTURE.md   # Technik + Performance-Budget
│   ├── ASSET-PIPELINE.md # Fotogrammetrie-Workflow
│   └── LEVELS.md         # Startlevel + Referenz-Recherche
└── assets/
    └── models/           # Fotogrammetrie-GLBs, pro Level ein Ordner
```

## Nächste Schritte

- [ ] Foto-Sets für die drei Denkmäler (60–150 Fotos je Denkmal, siehe docs/ASSET-PIPELINE.md)
- [ ] Fotogrammetrie-Pipeline am echten Denkmal testen (Meshroom → Blender → GLB)
- [ ] Slot-Layouts pro Level statt Standard-Ringen
- [ ] Perk-Kartenset (1 aus 3, alle 5 Wellen)
- [ ] Tech-Atome: Upgrade-Tree + Persistenz (localStorage, versioniert)
- [ ] Vite-Bundle für Offline-WebView statt CDN-Import
- [ ] dark-orchestrale KI-Musik + Sounds (WebView-Autoplay beachten)
- [ ] Rewarded-Video-Einbindung (nur Boni, nie Balancing)

**Hinweis:** Der Prototyp zeigt ein prozedurales Dummy-Denkmal und nutzt Platzhalter-Balancing, bis die echten GLB-Assets stehen.
