# Design-Brief – Denkmal Ansturm

**Stand:** 18.11.2026 · Komplett-Neuentwicklung, losgelöst von Denkmal TD2 · Repo live: https://github.com/imbaaalanced-dot/Denkmal-ansturm (public, Prototyp läuft via GitHub Pages)

Alle Entscheidungen stammen aus der Anforderungs-Runde mit Marcel (12 Fragen, 4 Runden) plus Fortführung (L01-Entscheidung: Löwe als Ziel).

## Vision

Dark-Fantasy-Tower-Defense im Denkmal-TD-Stil, aber komplett neu: Echte, real existierende Denkmäler als fotorealistische 3D-Zentren, um die herum Wellen von Monstern angreifen. Jedes Level = ein echtes Denkmal = 100 Wellen.

## Kerndaten

| Thema | Entscheidung |
| --- | --- |
| Engine | Browser, HTML/JS + Canvas-Basis |
| 3D-Umsetzung | Hybrid: echte 3D-Denkmäler (WebGL/Three.js), 2D-Effekte |
| Denkmal-Assets | Fotogrammetrie aus echten Referenzfotos (Foto-Upload oder Recherche) |
| Zielplattform | Android/WebView, Hochformat, 4-GB-Testgerät zuerst, Desktop parallel |
| Startumfang | 3 Level, je 100 Wellen |
| Geschwindigkeit | x1, x2, x3, x5 |
| Bosse | Jede 10. Welle; Boss = verdorbene Denkmal-Verstärkung |
| Perks (Ingame) | Nach je 5 Wellen: Roguelite-Wahl, 1 aus 3 zufälligen Karten, mit Specials |
| Meta-Progress | Hauptmenü-Upgrade-Tree mit separater Währung **Tech-Atome** |
| Tech-Atome | Nur durchs Spielen: Wellen, Level, Bosse (kein Kauf mit Geld) |
| Turmplatzierung | Feste Slot-Ringe um das Denkmal |
| Monster-Spawns | Komplett rund um das Denkmal (360°) |
| Welle 100 | Level abgeschlossen + Bonus-Challenge (New Game+) |
| Monetarisierung | Werbung: Banner + Rewarded Video |
| Sound/Musik | Komplett neu, dark-orchestral, KI-generiert |
| Türme/Helden/Monster | Komplett neu, nur der Stil bleibt (Dark Fantasy) |

## Startlevel

1. **Ender Dorfkirche (Herdecke)** – Zentrum/Verteidigungsziel: **der Löwe** des Kriegerdenkmals; Dorfkirche nur Kulisse am Kartenrand
2. **Kriegerdenkmal Kirchende** (Herdecke) – zu klären: Standort evtl. identisch mit L01
3. **Hohensyburg** (Wetter/Hagen)

Referenzen: Foto-Upload durch Marcel (erste 8 Referenzen L01 vorhanden) oder Recherche.

## Offene Punkte für die Umsetzung

- Fotogrammetrie-Setup (Meshroom/RealityCapture → Low-Poly für WebView, Dezimierung + Textur-Budget, siehe ASSET-PIPELINE.md)
- Sprachfassung v1: Deutsch
- Turm-Kategorien und Heldenset: neue Entwürfe im TD-Stil
- Wellenkurven und Balancing-Kennzahlen je Level (100 Wellen, Boss-Wellen x10)
- Perk-Kartenset (Standard + Specials) und Tech-Atome-Tree-Struktur
- Rewarded-Video-Einbettung (z. B. Tech-Atome-Bonus, Perk-Reroll) ohne Fairness-Bruch
