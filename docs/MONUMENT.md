# Denkmal-Selbstverteidigung & Upgrades (wie Evil Tower)

## Selbstverteidigung
- Ab Welle 1 feuert der **Wächterfunke** (goldener Kristall über dem Löwen) goldene Projektile auf Gegner in Reichweite.
- Basiswerte: Schaden 6, 1 Schuss/s, Reichweite 5,5 (Platzhalter-Balancing).
- Die Projektile fliegen wie Turmgeschosse (homing) und profitieren nicht von Turm-Perks (eigene Upgrade-Schiene).

## Upgrade-Panel
- Öffnen: 🦁-Button **oder** Denkmal im Bild antippen (auch mitten im Run). Pausiert die Simulation (Zustand `monument`).
- Bezahlt wird mit **Energie** aus Kopfgeld und Wellen-Bonus – damit hat die Währung mitten im Run einen echten Verwendungszweck.
- Heilung nur möglich, wenn der Löwe Schaden genommen hat ("Voll" = deaktiviert).

| Upgrade | Effekt je Stufe | max. Stufen | Grundkosten |
|---|---|---|---|
| 🔥 Golddornen | +4 Funken-Schaden | 10 | 15 ⚡ (je Stufe ×1,6) |
| ⚡ Zorn des Löwen | Feuertempo ×1,14 | 8 | 20 ⚡ (je Stufe ×1,6) |
| 🌀 Wachender Funk | +0,9 Reichweite | 6 | 20 ⚡ (je Stufe ×1,6) |
| 🛡️ Steinmetz-Ruf | Löwe heilt +150 LP | beliebig | 30 ⚡ fix |

## Technik
- `Game.monu` hält Werte + Stufen; `MONUMENT_UPGRADES` (src/game.js) = datengetriebene Definition mit `level/cost/desc/cant`-Funktionen.
- `Game.monumentOffers()` liefert die Panel-Zeilen inkl. Kosten/Deaktiviert-Logik, ui.js rendert nur DOM (keine Spiellogik im HUD).
- Perk-Multiplikatoren (docs/PERKS.md) greifen auf das Denkmal bewusst nicht: es hat seine eigene Ausbau-Schiene.
