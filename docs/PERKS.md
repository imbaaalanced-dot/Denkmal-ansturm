# Perk-System (Roguelite)

## Kernregel
- Nach jeder 5. Welle (5, 10, 15 … 95) öffnet sich die **Stärken-Wahl: 1 aus 3** zufälligen Perks.
- Die Wahl pausiert das Spiel (Zustand `perk`). Nach der Wahl bleiben 3 Sek. Bauzeit bis zur nächsten Welle.
- Perks wirken sofort auf **alle** Türme (auch bereits gebaute): Multiplikatoren werden zur Schusszeit angewandt.
- Nach Welle 100 (Sieg) folgt keine Wahl mehr, New Game+ schließt sich an.
- Stapeln: Jedes Perk hat eine maximale Stufe, mehrfach ziehbare Perke wachsen pro Stufe.

## Perk-Pool (Platzhalter-Balancing)
| Perk | Effekt | max. Stufen |
|---|---|---|
| Wächter-Klinge ⚔️ | +25 % Schaden aller Türme | 5 |
| Eiliger Bolzen 🏹 | +20 % Feuerrate aller Türme | 5 |
| Wachsame Augen 👁️ | +20 % Reichweite aller Türme | 4 |
| Kriegsbeute 💰 | +30 % Kopfgeld | 4 |
| Energiesegen ⚡ | +8 Bonus-Energie pro geschaffter Welle | 4 |
| Steinhaut 🛡️ | Löwe heilt 120 LP (sofort) | 5 |
| Frosthauch ❄️ | Treffer verlangsamen Gegner im Umkreis 2 s (−25 %, max −45 %) | 2 |
| Sprengbolzen 💥 | 50 % Flächenschaden, Radius +1,3 je Stufe | 2 |
| Schwachstelle 🎯 | +20 % Krit-Chance (Doppelschaden, goldenes Projektil) | 2 |

## Draw & Reroll

- Ungesehene Perks werden mit Gewicht 2.5 gezogen (neue Optionen bevorzugt, `rollPerkOptions`).
- **1x pro Run gratis neu würfeln** (🔄-Karte im Perk-Panel, Zähler `rerolls` im Checkpoint gespeichert).
  Rewarded-Video-Reroll als weitere Quelle siehe DESIGN-BRIEF (offen).

## Technik
- `src/perks.js`: Pool + `rollPerkOptions(chosen)` (zieht 3 unterschiedliche Optionen, respektiert max-Stufen).
- `Game.perk` hält alle aktiven Multiplikatoren; `Game.chosenPerks` die gezogenen IDs (für Savegames/Meta später).
- Zustand `perk` friert die Simulation ein (nur Atmosphäre läuft weiter); der Start-Button blockiert bis zur Wahl.


## Ehrenplatz (10. Perk, einmalig)

- Icon: 🗼, max 1 Stufe (danach raus aus dem Karten-Pool)
- Effekt: Oeffnet einen 5., goldglitzernden Turmplatz im Nordost (zwischen N und O, Radius 6.5 wie die Normalplaetze)
- Er ist der EINZIGE Platz, der auch mitten im Run bebaut werden darf
  (gezielte Ausnahme von der Regel "Aufstellung nur vor Welle 1"); Kosten 10 Energie wie jeder Turm
- Die Turm-Typ-Leiste (Bolzen/Splitter/Frost) erscheint automatisch wieder,
  solange der Ehrenplatz offen ist (ui.js setState via gameRef.hasOpenExtraPad())
- Persistenz: chosenPerks enthaelt 'platz'; restore legt den Platz NEU an, bevor die
  Tuerme wiederaufgebaut werden; ein bebauter Ehrenplatz serialisiert als pad 'NO' (maxTowerSlots = 5)
- Neustart (reset) entfernt den Ehrenplatz wieder: Er gehoert zum Run, nicht zum Level
