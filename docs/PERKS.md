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
| Steinhaut 🛡️ | Löwe heilt 120 LP (sofort) | beliebig |
| Frosthauch ❄️ | Treffer verlangsamen Gegner im Umkreis 2 s (−25 %, max −45 %) | 2 |
| Sprengbolzen 💥 | 50 % Flächenschaden, Radius +1,3 je Stufe | 2 |
| Schwachstelle 🎯 | +20 % Krit-Chance (Doppelschaden, goldenes Projektil) | 2 |

## Technik
- `src/perks.js`: Pool + `rollPerkOptions(chosen)` (zieht 3 unterschiedliche Optionen, respektiert max-Stufen).
- `Game.perk` hält alle aktiven Multiplikatoren; `Game.chosenPerks` die gezogenen IDs (für Savegames/Meta später).
- Zustand `perk` friert die Simulation ein (nur Atmosphäre läuft weiter); der Start-Button blockiert bis zur Wahl.
